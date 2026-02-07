import type { YookassaCreatePaymentResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { value, description, metadata } = await req.json();

    if (typeof value !== "number" || !description) {
      return NextResponse.json({ error: "Value (number) and description are required" }, { status: 400 });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_KEY;
    if (!shopId || !secretKey) {
      return NextResponse.json({ error: "Missing Yookassa credentials" }, { status: 500 });
    }

    const order = metadata?.order;
    const items = order?.items;
    const email = order?.email ?? metadata?.email;

    if (!Array.isArray(items) || items.length === 0 || !email) {
      return NextResponse.json({ error: "Order items and customer email are required for receipt" }, { status: 400 });
    }

    for (const it of items) {
      if (typeof it?.price !== "number" || typeof it?.quantity !== "number") {
        return NextResponse.json({ error: "Each item must include numeric price and quantity" }, { status: 400 });
      }
    }

    const idempotenceKey = uuidv4();
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/thanks?orderId=${metadata?.orderId}`;

    const paymentData = {
      amount: { value: value.toFixed(2), currency: "RUB" },
      capture: false,
      confirmation: { type: "redirect", return_url: returnUrl },
      description,
      metadata: { orderId: metadata?.orderId },
      receipt: {
        customer: { email },
        items: items.map((item: any) => ({
          description: item.name ?? `Offer ${item?.offer?.id ?? ""}`,
          quantity: item.quantity,
          amount: { value: Number(item.price).toFixed(2), currency: "RUB" },
          vat_code: 1,
          payment_mode: "full_prepayment",
          payment_subject: "commodity",
          measure: "piece",
        })),
      },
    };

    const response = await fetch(`${process.env.YOOKASSA_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data: YookassaCreatePaymentResponse = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
