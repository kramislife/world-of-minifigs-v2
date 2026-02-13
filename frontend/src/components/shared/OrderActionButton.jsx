import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useCart";

const BASE_CLASSES = "w-full uppercase font-bold tracking-widest rounded-none";

// Add to Cart Button
export const AddToCartButton = ({
  product,
  variantIndex = null,
  quantity = 1,
  onSuccess,
  className = "",
  variant = "default",
}) => {
  const { isSoldOut, label, onClick, isLoading } = useAddToCart({
    product,
    variantIndex,
    quantity,
    onSuccess,
  });

  return (
    <Button
      onClick={onClick}
      disabled={isSoldOut || isLoading}
      variant={variant}
      className={`${BASE_CLASSES} ${className}`}
    >
      {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
      {isLoading ? "Adding to cart..." : label}
    </Button>
  );
};

// Checkout Button
export const CheckoutButton = ({
  label = "Checkout",
  onClick = () => {},
  disabled = false,
  isLoading = false,
  className = "",
  variant = "dark",
}) => (
  <Button
    onClick={onClick}
    disabled={disabled || isLoading}
    variant={variant}
    className={`${BASE_CLASSES} ${className}`}
  >
    {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
    {isLoading ? "Redirecting..." : label}
  </Button>
);
