import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantityControl from "@/components/shared/QuantityControl";
import Logo from "@/assets/media/Logo.png";

const CartItem = ({ item, onDecrement, onIncrement, onRemove }) => {
  const {
    productId,
    productName,
    variantIndex,
    quantity,
    image,
    displayPrice,
    originalPrice,
    hasDiscount,
    totalItemPrice,
    colorDisplay,
    stock,
  } = item;

  return (
    <div className="flex gap-3 group pb-5 border-b last:border-0 last:pb-0">
      <div className="relative w-28 h-28 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 border">
            <img
              src={Logo}
              alt="No image"
              className="w-full h-full object-contain opacity-50"
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <h4
              className="font-bold text-sm leading-tight line-clamp-1 min-w-0"
              title={productName}
            >
              {productName}
            </h4>
            <span className="font-extrabold text-sm text-success dark:text-accent whitespace-nowrap">
              ${totalItemPrice}
            </span>
          </div>

          <div className="mt-1 space-y-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xs font-bold">${displayPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
            {colorDisplay && (
              <p className="text-xs text-muted-foreground">{colorDisplay}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <QuantityControl
            value={quantity}
            onDecrement={() => onDecrement(productId, variantIndex)}
            onIncrement={() => onIncrement(productId, variantIndex)}
            min={1}
            max={stock}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-transparent"
            onClick={() => onRemove(productId, variantIndex)}
            title="Remove item"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
