import React from "react";
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({
  isActive,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  variant,
  className,
  children,
}) => {
  return (
    <Badge
      variant={variant || (isActive ? "success" : "destructive")}
      className={className}
    >
      {children || (isActive ? activeLabel : inactiveLabel)}
    </Badge>
  );
};

export default StatusBadge;
