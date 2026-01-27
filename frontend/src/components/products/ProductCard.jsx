import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Logo from "@/assets/media/Logo.png";
import { useProductCardHoverImages } from "@/hooks/useProducts";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
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

  const handleNavigate = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg p-0 gap-2"
    >
      <CardHeader className="p-0">
        <div
          className="relative aspect-square overflow-hidden border-b border-border"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {imageUrls.length > 0 ? (
            <div className="relative h-full w-full">
              {imageUrls.map((url, index) => (
                <img
                  key={`${product._id}-${url}-${index}`}
                  src={url}
                  alt={`${product.productName}${hasMultipleImages ? ` - Image ${index + 1}` : ""}`}
                  className={[
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                    index === currentImageIndex
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0",
                  ].join(" ")}
                  style={{ transition: "opacity 0.5s ease-in-out" }}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={Logo}
                alt="Product placeholder"
                className="max-h-40 max-w-40 object-contain opacity-80"
              />
            </div>
          )}

          {/* Discount Badge */}
          {product.discount && (
            <Badge variant="accent" className="absolute top-2 right-2 z-10">
              {product.discount}% OFF
            </Badge>
          )}

          {/* Bottom CTA (on top of image) */}
          <div className="absolute inset-x-0 bottom-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/70 to-transparent" />
            <div className="relative flex justify-center pb-5">
              <Button
                variant="accent"
                className="pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
              >
                View Details
              </Button>
            </div>
          </div>
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
