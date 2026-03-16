import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const VisibilitySwitch = ({
  id = "isActive",
  label = "Visibility",
  description = "When disabled, this item will be hidden from public listings",
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>

        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <Switch
        id={id}
        name={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default VisibilitySwitch;
