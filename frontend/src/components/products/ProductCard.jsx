import React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CommonImage from "@/components/shared/CommonImage";
import { AddToCartButton } from "@/components/shared/OrderActionButton";
import { formatCurrency } from "@/utils/formatting";
import {
  useProductCard,
  useProductCardHoverImages,
} from "@/hooks/useProductCard";

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
      className={`group cursor-pointer gap-0 py-2 transition-all duration-300 ${
        isSoldOut ? "opacity-75" : ""
      }`}
    >
      <CardHeader
        className="relative aspect-square"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {imageUrls.map((url, index) => (
          <CommonImage
            key={`${product._id}-${index}`}
            src={url}
            alt={`${product.productName}${
              hasMultipleImages ? ` - Image ${index + 1}` : ""
            }`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}

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
      </CardHeader>

      <CardContent className="flex flex-col gap-2 px-3 py-3 border-t">
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
            {formatCurrency(product.displayPrice)}
          </span>
          {product.hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.price)}
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
