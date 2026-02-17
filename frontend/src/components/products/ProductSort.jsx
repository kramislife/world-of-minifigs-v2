import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SORT_OPTIONS } from "@/constant/productFilters";

const ProductSort = ({
  sortBy,
  onSortChange,
  id = "sort-select",
  className = "",
  showLabel = true,
  labelText = "Sort by:",
  variant = "default", // "default" | "mobile"
}) => {
  const isMobile = variant === "mobile";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <Label
          htmlFor={id}
          className={isMobile ? "text-sm whitespace-nowrap" : ""}
        >
          {labelText}
        </Label>
      )}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger id={id} className={isMobile ? "flex-1" : ""}>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSort;
