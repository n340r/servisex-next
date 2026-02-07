import { ProductsShowcase } from "@/components";
import { BaseLayout } from "@/layouts/BaseLayout";
import { retailCrm } from "@/lib/server/config";
import { transformAllProductsData } from "@/lib/utils";
import { GetProductsResponse, ShopItem } from "@/types";

const fetchProducts = async (): Promise<ShopItem[]> => {
  const response = await fetch(`${retailCrm.endpoints.products}?apiKey=${retailCrm.apiKey}`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("[Shop] Failed to fetch products");
  }

  const data: GetProductsResponse = await response.json();
  const { transformedProducts } = transformAllProductsData(data.products);
  return transformedProducts;
};

const ShopPage = async () => {
  const products = await fetchProducts();

  return (
    <BaseLayout>
      <ProductsShowcase products={products} />
    </BaseLayout>
  );
};

export default ShopPage;
