import "server-only";

type Mode = "production" | "development";

const mode: Mode =
  (process.env.RETAILCRM_ENV as Mode) ?? (process.env.NODE_ENV === "production" ? "production" : "development");

function req(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const prodBase = process.env.RETAILCRM_PROD_BASE_URL ?? "https://goshamartynovich.retailcrm.ru";
const devBase = process.env.RETAILCRM_TEST_BASE_URL ?? "https://servisex-dev-vercel.retailcrm.ru";

const baseUrl = mode === "production" ? prodBase : devBase;
const apiKey = mode === "production" ? req("RETAILCRM_API_KEY") : req("RETAILCRM_TEST_API_KEY");

export const retailCrm = {
  mode,
  baseUrl,
  apiKey,
  endpoints: {
    products: `${baseUrl}/api/v5/store/products`,
    orders: `${baseUrl}/api/v5/orders`,
    createOrder: `${baseUrl}/api/v5/orders/create`,
  },
};

export const yookassa = {
  prod: {
    shopId: req("YOOKASSA_SHOP_ID"),
    key: req("YOOKASSA_KEY"),
  },
  dev: {
    shopId: req("YOOKASSA_TEST_SHOP_ID"),
    key: req("YOOKASSA_TEST_KEY"),
  },
};
