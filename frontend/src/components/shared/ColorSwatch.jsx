import React from "react";

const sizeMap = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

const ColorSwatch = ({ color, label, size = "sm", className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div
      className={`${sizeMap[size] || sizeMap.sm} rounded-full shrink-0 border`}
      style={{ backgroundColor: color || "#000" }}
    />
    {label && <span>{label}</span>}
  </div>
);

export default React.memo(ColorSwatch);
