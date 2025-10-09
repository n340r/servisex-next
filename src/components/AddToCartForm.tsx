"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  Button,
  ConfirmationDialog,
  DelayedSelect,
  Form,
  FormControl,
  FormField,
  FormItem,
  QuantitySelector,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components";
import { useCart, useProductDialog } from "@/hooks";
import { cn, findAllPossibleOffersOfAProduct, findOffer, transformSingleProductData } from "@/lib/utils";
import { PossibleOffer, TransformedProductData } from "@/types";
import { ProductPreviewData } from "@/types";
import { GetProductsResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  product: ProductPreviewData;
  color: string;
  possibleOffers: PossibleOffer[];
};

const FormSchema = z.object({
  size: z.string().min(1, { message: "Выберите размер" }),
});

const AddToCartForm = ({ product, color }: Props) => {
  const router = useRouter();
  const { addItem, items, incrementItemQuantity, decrementItemQuantity, setItemQuantity } = useCart();
  const [currentOffer, setCurrentOffer] = useState<PossibleOffer | undefined>(undefined);
  const quantity = (currentOffer && items.find((item) => item.id === currentOffer?.id)?.quantity) || 0;
  const maxAvailableQuantity = currentOffer?.availableQuantity;
  type ProductForm = z.infer<typeof FormSchema>;
  const { isDialogOpen, offerToRemove, setIsDialogOpen, prepareProductForDeletion, handleRemoveProduct } =
    useProductDialog();

  const { isLoading, error, data } = useQuery<GetProductsResponse, Error, TransformedProductData>({
    queryKey: [product.parentProductId],
    queryFn: () => fetch(`/api/getProductsByIds?ids=${product.parentProductId}`).then((res) => res.json()),
    select: (data) => {
      const rawProduct = data.products[0];

      if (!rawProduct) {
        throw new Error("Product not found");
      }

      const dynamicProduct = transformSingleProductData(rawProduct);
      const dynamicPossibleOffers = findAllPossibleOffersOfAProduct(rawProduct);
      return {
        dynamicProduct,
        dynamicPossibleOffers,
      };
    },
  });

  const dynamicProduct = data?.dynamicProduct;
  const dynamicPossibleOffers = data?.dynamicPossibleOffers;
  const itemAlreadyInCart = dynamicPossibleOffers && items.some((item) => item.id === currentOffer?.id);
  const isOneSize = !dynamicProduct?.sizes.length;
  const initialSize = dynamicPossibleOffers?.find((offer) => !offer.isOutOfStock)?.properties.size;

  const handleToast = (product: PossibleOffer) => {
    toast("ТОВАР ДОБАВЛЕН В КОРЗИНУ", {
      description: product.name,
      duration: 2000,
      action: {
        label: "В КОРЗИНУ",
        onClick: () => {
          router.push(`/cart`);
          toast.dismiss();
        },
      },
    });
  };

  const handleMaxQuantityAlertToast = useCallback(() => {
    toast.info("Товар раскупают. Получится заказать чуть меньше", {
      duration: 2000,
    });
  }, []);

  const handleAddProductToCart = (data: ProductForm) => {
    if (dynamicPossibleOffers) {
      const offer = findOffer(dynamicPossibleOffers, color, data.size, product?.name);
      if (offer) {
        addItem(offer);
        handleToast(offer);
      }
    }
  };

  const form = useForm<ProductForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      size: "",
    },
  });

  useEffect(() => {
    if (initialSize) {
      form.setValue("size", initialSize);
    }
  }, [initialSize, form]);

  const size = useWatch({
    control: form.control,
    name: "size",
  });

  const handleIncrement = () => {
    if (!currentOffer) return;

    if (itemAlreadyInCart) {
      incrementItemQuantity(currentOffer.id);
    } else {
      addItem(currentOffer);
      handleToast(currentOffer);
    }
  };

  const handleDecrement = () => {
    if (!currentOffer) return;

    if (itemAlreadyInCart && quantity === 1) {
      prepareProductForDeletion(currentOffer);
    } else if (itemAlreadyInCart) {
      decrementItemQuantity(currentOffer.id);
    }
  };

  useEffect(() => {
    if (dynamicPossibleOffers) {
      const offer = findOffer(dynamicPossibleOffers, color, size, product?.name);
      offer && setCurrentOffer(offer);
    }
  }, [color, size, dynamicPossibleOffers, product?.name]);

  useEffect(() => {
    if (currentOffer && maxAvailableQuantity !== undefined && quantity > maxAvailableQuantity) {
      setItemQuantity(currentOffer.id, maxAvailableQuantity);
      handleMaxQuantityAlertToast();
    }
  }, [maxAvailableQuantity, quantity, currentOffer, setItemQuantity, handleMaxQuantityAlertToast]);

  if (error) return "An error has occurred: " + (error as Error).message;

  if (isLoading || !data || !initialSize) {
    return (
      <div className="grid gap-4 mt-4 pointer-events-none">
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex gap-4 w-full">
            <Skeleton className="h-12 flex-grow border border-foreground flex items-center justify-center  uppercase text-xs font-medium" />
            <Skeleton className="h-12 flex-grow border border-foreground flex items-center justify-center  uppercase text-xs font-medium" />
          </div>
          <Skeleton className="h-12 w-full border border-foreground flex items-center justify-center  uppercase text-xs font-medium"></Skeleton>
        </div>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddProductToCart)} className="grid gap-4 mt-4">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex gap-4 w-full">
              {isOneSize ? (
                <div className="h-12 w-full flex-grow max-w-[50%] border border-foreground flex items-center justify-center  uppercase text-xs font-medium">
                  один размер
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field, fieldState }) => (
                    <FormItem className="h-12 border border-foreground w-full flex-grow max-w-[50%] flex items-center justify-center  uppercase text-xs font-medium">
                      <DelayedSelect onValueChange={field.onChange} defaultValue={initialSize}>
                        <FormControl>
                          <SelectTrigger
                            className={cn("focus-visible:border-primary w-full", {
                              "border-error": fieldState.error,
                            })}
                          >
                            <SelectValue placeholder={<p className="text-muted-foreground">Размер</p>} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dynamicProduct.sizes.map((size) => (
                            <SelectItem key={size.value} value={size.value} disabled={!size.quantity}>
                              <span
                                className={cn("uppercase  w-full", {
                                  "text-error pointer-events-none": !size.quantity,
                                })}
                              >
                                {!size.quantity ? (
                                  <span className="text-error uppercase z-[-1]">{size.value} - Распродано</span>
                                ) : (
                                  <span>{size.value}</span>
                                )}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </DelayedSelect>
                    </FormItem>
                  )}
                />
              )}
              <QuantitySelector
                value={quantity}
                maxValue={maxAvailableQuantity}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                className="flex-grow max-w-[]"
              />
            </div>
            <Button
              type="submit"
              className="w-full text-foreground"
              variant="outline"
              size="lg"
              disabled={itemAlreadyInCart}
            >
              {itemAlreadyInCart ? "УЖЕ В КОРЗИНЕ" : "ДОБАВИТЬ В КОРЗИНУ"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        productToRemove={offerToRemove}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        handleRemoveProduct={handleRemoveProduct}
      />
    </>
  );
};

export { AddToCartForm };
