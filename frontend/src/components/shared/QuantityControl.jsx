import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_SAFE_QTY = Number.MAX_SAFE_INTEGER;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const QuantityControl = ({
  value,
  onDecrement,
  onIncrement,
  onValueChange,
  min = 1,
  max = Infinity,
  allowInput = false,
  className = "",
  valueClassName = "w-8",
}) => {
  const safeMax = Number.isFinite(max)
    ? Math.min(max, MAX_SAFE_QTY)
    : MAX_SAFE_QTY;
  const numericValue = toNumber(value, 0);

  const emitClampedValue = (nextValue) => {
    if (!onValueChange) return;
    onValueChange(clamp(nextValue, min, safeMax));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onValueChange?.("");
      return;
    }

    // Block scientific notation and signed values for quantity input
    if (/e|E|\+|\-/.test(raw)) return;

    // Keep only integer quantities
    if (!/^\d+$/.test(raw)) return;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      emitClampedValue(safeMax);
      return;
    }

    emitClampedValue(parsed);
  };

  const handleInputBlur = () => {
    if (!allowInput || !onValueChange) return;
    if (value === "" || Number.isNaN(Number(value))) {
      onValueChange(min);
      return;
    }

    emitClampedValue(toNumber(value, min));
  };

  return (
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
        disabled={numericValue <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3" />
      </Button>

      {allowInput ? (
        <Input
          type="number"
          min={min}
          max={safeMax}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-", "."].includes(e.key)) {
              e.preventDefault();
            }
          }}
          readOnly={!onValueChange}
          className={`border-0 text-center text-xs font-bold focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none ${valueClassName}`}
          aria-label="Quantity input"
        />
      ) : (
        <span
          className={`text-center text-xs font-bold ${valueClassName} `}
          role="status"
          aria-live="polite"
        >
          {value}
        </span>
      )}

      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="text-black hover:bg-transparent disabled:opacity-30"
        onClick={onIncrement}
        disabled={numericValue >= safeMax}
        aria-label="Increase quantity"
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
};

export default QuantityControl;
