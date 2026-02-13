import React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Logo from "@/assets/media/Logo.png";
import { AddToCartButton } from "@/components/shared/OrderActionButton";
import { useProductCard, useProductCardHoverImages } from "@/hooks/useProducts";

const ProductCard = ({ product }) => {
  const { handleNavigate, isSoldOut } = useProductCard(product);
  const {
    imageUrls,
    currentImageIndex,
    hasMultipleImages,
    handleMouseEnter,
    handleMouseLeave,
  } = useProductCardHoverImages(product, {
    hoverDelayMs: 1000,
    cycleIntervalMs: 1500,
  });

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`View product ${product.productName}`}
      onClick={handleNavigate}
      onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
      className={`group cursor-pointer hover:shadow-lg p-0 gap-2 transition-all duration-300 ${
        isSoldOut ? "opacity-75" : ""
      }`}
    >
      <CardHeader className="p-0 gap-0">
        <div
          className="relative aspect-square overflow-hidden border-b border-border"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {imageUrls.length > 0 ? (
            <div className={`relative h-full w-full`}>
              {imageUrls.map((url, index) => (
                <img
                  key={`${product._id}-${url}-${index}`}
                  src={url}
                  alt={`${product.productName}${
                    hasMultipleImages ? ` - Image ${index + 1}` : ""
                  }`}
                  title={`Go to ${product.productName}`}
                  className={[
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                    index === currentImageIndex
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0",
                  ].join(" ")}
                />
              ))}
            </div>
          ) : (
            <div className={`flex h-full w-full items-center justify-center`}>
              <img
                src={Logo}
                alt="Product placeholder"
                title={product.productName}
                className="max-h-40 max-w-40 object-contain opacity-80"
              />
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
            {isSoldOut ? (
              <Badge variant="destructive">Sold Out</Badge>
            ) : (
              product.discount && (
                <Badge variant="accent">{product.discount}% OFF</Badge>
              )
            )}
          </div>

          {/* Add to Cart Button Logic */}
          {!isSoldOut && (
            <div className="absolute inset-x-0 bottom-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-2">
              <AddToCartButton
                product={product}
                variant="dark"
                className="translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 px-3 pb-5">
        {/* Product Name */}
        <h2
          className="text-lg font-semibold line-clamp-1"
          title={product.productName}
        >
          {product.productName}
        </h2>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-success dark:text-accent">
            ${product.displayPrice?.toFixed(2) || "0.00"}
          </span>
          {product.hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.price?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">(0)</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
