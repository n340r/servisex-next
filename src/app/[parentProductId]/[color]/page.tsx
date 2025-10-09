import { AddToCartForm, BaseCarousel, Gallery, InfoBlock } from "@/components";
import { BaseLayout } from "@/layouts";
import { retailCrm } from "@/lib/server/config";
import { formatPrice } from "@/lib/utils";
import { findAllPossibleOffersOfAProduct, transformAllProductsData, transformSingleProductData } from "@/lib/utils";
import { GetProductsResponse, Product, ShopItem } from "@/types";

export const dynamicParams = false;

const fetchProducts = async (): Promise<ShopItem[]> => {
  const response = await fetch(`${retailCrm.endpoints.products}?apiKey=${retailCrm.apiKey}`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("[Product] Failed to fetch products");
  }

  const data: GetProductsResponse = await response.json();
  const { transformedProducts } = transformAllProductsData(data.products);
  return transformedProducts;
};

const fetchSingleProduct = async (parentProductId: string, _color?: string): Promise<Product> => {
  const response = await fetch(
    `${retailCrm.endpoints.products}?apiKey=${retailCrm.apiKey}&filter[ids][]=${parentProductId}`,
    { cache: "force-cache" },
  );

  if (!response.ok) {
    throw new Error("[Product] Failed to fetch one product");
  }

  const data: GetProductsResponse = await response.json();
  const product = data.products.at(0);

  if (!product) {
    throw new Error(`[Product] Not found for id=${parentProductId}`);
  }

  return product;
};

// Generate static paths based on fetched products
export async function generateStaticParams() {
  const products = await fetchProducts();

  return products.map((product) => ({
    parentProductId: product.parentProductId.toString(),
    color: product.color ? product.color : "no-color",
  }));
}

interface ProductPageProps {
  params: {
    parentProductId: string;
    color: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { parentProductId, color } = params;

  const rawProduct = await fetchSingleProduct(parentProductId, color);
  const product = transformSingleProductData(rawProduct, color);
  const productPossibleOffers = findAllPossibleOffersOfAProduct(rawProduct);

  return (
    <BaseLayout>
      <>
        <div className="w-full grid sm:grid-cols-[1fr_400px] gap-8 sm:px-4">
          <div className="relative flex items-center sm:order-first flex-col h-fit gap-4">
            <Gallery
              imageUrls={product?.imgs}
              productName={product.name}
              className="hidden sm:flex sm:flex-col md:grid md:grid-cols-2 gap-4 w-full"
            />
            <BaseCarousel
              imageUrls={product.imgs}
              productName={product.name}
              className="block sm:hidden w-full aspect-[1/1]"
            />
          </div>

          <div className="flex px-2 sm:px-0 flex-col  mb-16">
            <div className="flex flex-col gap-8">
              <h1 className="text-3xl  font-bold uppercase">{product?.name}</h1>
              <div className="flex items-center justify-between">
                <span className="text-3xl  uppercase">{formatPrice(product.price)} ₽</span>
              </div>
            </div>

            <div className="grid gap-4 mt-8 text-xs leading-loose">
              <InfoBlock title="описание" content={<span className="">{product?.description}</span>} />
            </div>

            <AddToCartForm product={product} color={color} possibleOffers={productPossibleOffers} />
          </div>
        </div>
      </>
    </BaseLayout>
  );
}
