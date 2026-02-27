import React from "react";
import { Badge } from "@/components/ui/badge";

const StatusBadge = ({
  isActive,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  className,
}) => {
  return (
    <Badge variant={isActive ? "success" : "destructive"} className={className}>
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
};

export default StatusBadge;
