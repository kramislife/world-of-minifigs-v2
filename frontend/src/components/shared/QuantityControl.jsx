import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuantityControl = ({
  value,
  onDecrement,
  onIncrement,
  min = 1,
  max = Infinity,
  className = "",
  valueClassName = "w-8",
}) => (
  <div
    className={`flex items-center border border-border ${className}`}
    role="group"
    aria-label="Quantity"
  >
    <Button
      variant="ghost"
      size="sm"
      type="button"
      className="text-black hover:bg-transparent disabled:opacity-30"
      onClick={onDecrement}
      disabled={value <= min}
      aria-label="Decrease quantity"
    >
      <Minus className="size-3" />
    </Button>
    <span
      className={`text-center text-xs font-bold ${valueClassName} `}
      role="status"
      aria-live="polite"
    >
      {value}
    </span>
    <Button
      variant="ghost"
      size="sm"
      type="button"
      className="text-black hover:bg-transparent disabled:opacity-30"
      onClick={onIncrement}
      disabled={value >= max}
      aria-label="Increase quantity"
    >
      <Plus className="size-3" />
    </Button>
  </div>
);

export default QuantityControl;
