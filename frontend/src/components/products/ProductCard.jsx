import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Logo from "@/assets/media/Logo.png";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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
        <div className="relative aspect-square overflow-hidden border-b border-border">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={Logo}
                alt="Product placeholder"
                className="max-h-40 max-w-40 object-contain opacity-80"
              />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <Button
              variant="accent"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 px-3 pb-5">
        {/* Product Name */}
        <h2 className="text-lg font-semibold line-clamp-2">
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
