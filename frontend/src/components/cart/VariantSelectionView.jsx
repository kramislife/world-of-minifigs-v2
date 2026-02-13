import React from "react";
import {
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/shared/OrderActionButton";
import { useVariantSelection } from "@/hooks/useCart";

const VariantSelectionView = ({ product, switchToCart }) => {
  const {
    selectedVariantIndex: idx,
    setSelectedVariantIndex: setIdx,
    carouselImages,
    normalizedColorVariants,
    selectedColorName,
    displayPrice,
    originalPrice,
    hasDiscount,
    setApi,
  } = useVariantSelection({ product });

  return (
    <>
      <SheetHeader className="p-5 border-b flex flex-row items-center justify-between">
        <SheetTitle className="text-2xl font-bold uppercase">
          Choose Options
        </SheetTitle>
        <SheetDescription className="sr-only">
          Select a variant for {product.productName}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <Carousel
            setApi={setApi}
            opts={{ align: "start" }}
            className="w-full"
          >
            <CarouselContent>
              {carouselImages.map((img, i) => (
                <CarouselItem key={i} className="basis-1/2">
                  <div
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      idx === i ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={product.productName}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="px-5 space-y-5">
          <div className="mt-3">
            <h3 className="text-2xl font-bold">{product.productName}</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-success">
                ${displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          {normalizedColorVariants.length > 0 && (
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Color:{" "}
                <span className="text-foreground">{selectedColorName}</span>
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {normalizedColorVariants.map((v) => (
                  <Button
                    key={v.index}
                    variant="ghost"
                    size="icon"
                    onClick={() => setIdx(v.index)}
                    className={`relative size-6 rounded-full border-2 transition-all p-0 hover:bg-transparent group ${
                      idx === v.index
                        ? "border-accent"
                        : "border-border hover:border-destructive"
                    }`}
                    style={
                      v.secondaryHexCode
                        ? {
                            background: `linear-gradient(135deg, ${v.hexCode ?? "#ccc"} 50%, ${v.secondaryHexCode} 50%)`,
                          }
                        : {
                            backgroundColor: v.hexCode ?? "#ccc",
                          }
                    }
                    title={
                      v.secondaryColorName
                        ? `${v.colorName} / ${v.secondaryColorName}`
                        : v.colorName
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t">
        <AddToCartButton
          product={product}
          variantIndex={idx}
          quantity={1}
          onSuccess={switchToCart}
          variant="dark"
          className="h-12"
        />
      </div>
    </>
  );
};

export default VariantSelectionView;
