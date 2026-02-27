import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BannerButtonFields = ({
  formData,
  isSubmitting,
  handleValueChange,
  handleNestedChange,
}) => {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableButtons"
          checked={formData.enableButtons}
          onCheckedChange={handleValueChange("enableButtons")}
          disabled={isSubmitting}
        />
        <Label htmlFor="enableButtons" className="mt-0.5">
          Enable Redirect Buttons{" "}
          <span className="text-xs font-normal opacity-70">(Optional)</span>
        </Label>
      </div>

      {formData.enableButtons && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {formData.buttons.map((btn, i) => (
            <div key={i} className="space-y-4 border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Button {i + 1}{" "}
                  {i === 1 && (
                    <span className="opacity-70 font-normal">(Optional)</span>
                  )}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`btn-label-${i}`}>Button Label</Label>
                <Input
                  id={`btn-label-${i}`}
                  placeholder="e.g. Shop Now"
                  value={btn.label}
                  onChange={handleNestedChange("buttons", i, "label")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`btn-href-${i}`}>Link URL</Label>
                <Input
                  id={`btn-href-${i}`}
                  placeholder="/products, /collections..."
                  value={btn.href}
                  onChange={handleNestedChange("buttons", i, "href")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`btn-variant-${i}`}>Visual Style</Label>
                <Select
                  value={btn.variant || "primary"}
                  onValueChange={handleNestedChange("buttons", i, "variant")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id={`btn-variant-${i}`} className="w-full">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Solid Button</SelectItem>
                    <SelectItem value="outline">Outline Button</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerButtonFields;
