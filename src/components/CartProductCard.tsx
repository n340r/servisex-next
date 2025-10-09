"use client";

import { MouseEvent, useCallback, useEffect, useState } from "react";

import { Skeleton } from "@/components";
import { Button, CardContent, QuantitySelector } from "@/components";
import { useCart } from "@/hooks";
import { findAllPossibleOffersOfAProduct, formatPrice, transformSingleProductData } from "@/lib/utils";
import { GetProductsResponse, TransformedProductData } from "@/types";
import { CartItem, PossibleOffer } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartProductCardProps {
  product: CartItem;
  prepareProductForDeletion: (offer: PossibleOffer | CartItem) => void;
}

export const CartProductCard: React.FC<CartProductCardProps> = ({ product, prepareProductForDeletion }) => {
  const { incrementItemQuantity, decrementItemQuantity, setItemQuantity } = useCart();
  const [currentOffer, setCurrentOffer] = useState<PossibleOffer | undefined>(undefined);
  const maxAvailableQuantity = currentOffer?.availableQuantity || Infinity;
  const quantity = product.quantity;
  const firstImage = product.images?.[0];

  const handleRemoveProduct = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    prepareProductForDeletion(product);
  };

  const { isLoading, error, data } = useQuery<GetProductsResponse, Error, TransformedProductData>({
    queryKey: [product.parentProductId],
    queryFn: () => fetch(`/api/getProductsByIds?ids=${product.parentProductId}`).then((res) => res.json()),
    select: (data) => {
      const rawProduct = data.products?.[0];

      if (!rawProduct) {
        throw new Error("Product not found");
      }

      const dynamicProduct = transformSingleProductData(rawProduct);
      const dynamicPossibleOffers = findAllPossibleOffersOfAProduct(rawProduct);
      return { dynamicProduct, dynamicPossibleOffers };
    },
  });

  const dynamicPossibleOffers = data?.dynamicPossibleOffers;

  useEffect(() => {
    if (dynamicPossibleOffers) {
      const offer = dynamicPossibleOffers.find((offer) => offer.id === product.id);
      offer && setCurrentOffer(offer);
    }
  }, [dynamicPossibleOffers, product.id]);

  const handleIncrement = () => {
    if (!currentOffer) return;

    if (product.quantity < (currentOffer.availableQuantity || Infinity)) {
      incrementItemQuantity(currentOffer.id);
    }
  };

  const handleMaxQuantityAlertToast = useCallback(() => {
    toast.info("Товар раскупают. Получится заказать чуть меньше", {
      duration: 1000,
    });
  }, []);

  const handleDecrement = () => {
    if (!currentOffer) return;

    if (product.quantity > 1) {
      decrementItemQuantity(currentOffer.id);
    } else if (product.quantity === 1) {
      prepareProductForDeletion(product);
    }
  };

  useEffect(() => {
    if (currentOffer && maxAvailableQuantity !== undefined && quantity > maxAvailableQuantity) {
      setItemQuantity(currentOffer.id, maxAvailableQuantity);
      handleMaxQuantityAlertToast();
    }
  }, [maxAvailableQuantity, quantity, currentOffer, setItemQuantity, handleMaxQuantityAlertToast]);

  if (error) {
    return (
      <CardContent className="p-0 py-2 sm:p-4">
        <div>An error has occurred: {error.message}</div>;
      </CardContent>
    );
  }

  if (isLoading || !currentOffer) {
    return <CartProductCardSkeleton />;
  }

  return (
    <CardContent className="p-0 py-2 sm:p-4">
      <div className="grid gap-2 cursor-pointer">
        <div className="flex justify-between items-center gap-2">
          <ProductShopLink product={product} />
          <Button variant="ghost" size="icon" onClick={(e) => handleRemoveProduct(e)}>
            <X />
          </Button>
        </div>
        <div className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
          {firstImage ? (
            <Image
              src={firstImage}
              alt="Product template"
              width={64}
              height={64}
              className="object-cover aspect-square"
            />
          ) : (
            <Skeleton className="w-16 h-16 bg-muted" aria-hidden />
          )}
          <div>
            <p className=" text-xs lg:text-sm text-muted-foreground ">
              Цвет: {product.properties?.color ? <>{product.properties?.color} </> : <>Один цвет</>}
            </p>
            <p className=" text-xs lg:text-sm text-muted-foreground ">
              Размер: {product.properties?.size ? <>{product.properties?.size}</> : <>Один размер</>}
            </p>
            <p className=" text-xs lg:text-sm text-muted-foreground ">Цена: {formatPrice(product.price)} ₽</p>
          </div>
          <QuantitySelector
            value={product.quantity}
            maxValue={maxAvailableQuantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
      </div>
    </CardContent>
  );
};

interface ProductShopLinkProps {
  product: CartItem;
}

const ProductShopLink: React.FC<ProductShopLinkProps> = ({ product }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${product.parentProductId}/${product.properties.color || "one-color"}`);
  };

  return (
    <h3 className=" font-medium uppercase hover:underline" onClick={handleClick}>
      {product.parentProductName}
    </h3>
  );
};

export const CartProductCardSkeleton: React.FC = () => {
  return (
    <CardContent className="p-0 py-2 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="w-full h-6" />
        <Skeleton className="rounded-full h-9 aspect-square ml-12" />
      </div>

      <div className="grid grid-cols-[64px_1fr] items-center gap-4">
        <Skeleton className="h-16 w-16" />
        <div className="w-full flex justify-between flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </CardContent>
  );
};
