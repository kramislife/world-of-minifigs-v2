import React from "react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useCart";

const AddToCartButton = ({
  product,
  variantIndex = null,
  quantity = 1,
  className = "",
  variant = "default",
}) => {
  const { isSoldOut, label, onClick } = useAddToCart({
    product,
    variantIndex,
    quantity,
  });

  return (
    <Button
      onClick={onClick}
      disabled={isSoldOut}
      variant={variant}
      className={`w-full ${className}`}
    >
      {label}
    </Button>
  );
};

export default AddToCartButton;
