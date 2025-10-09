import { retailCrm } from "@/lib/server/config";
import { GetOrdersResponse } from "@/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400, headers: createCorsHeaders() });
  }

  try {
    const url = new URL(`${retailCrm.endpoints.orders}`);
    url.searchParams.set("apiKey", retailCrm.apiKey);
    url.searchParams.append("filter[ids][]", orderId);

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream request failed" }, { status: 502, headers: createCorsHeaders() });
    }

    const data: GetOrdersResponse = await response.json();

    const firstOrder = data.orders?.at(0);

    if (!data.success || !firstOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers: createCorsHeaders() });
    }

    return NextResponse.json({ status: firstOrder.status }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json({ error: "Failed fetching order status" }, { status: 500, headers: createCorsHeaders() });
  }
}

function createCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
