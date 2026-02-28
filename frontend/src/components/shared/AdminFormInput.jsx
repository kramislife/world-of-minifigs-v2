import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const AdminFormInput = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

export const AdminFormTextarea = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  className = "",
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={4}
        {...props}
      />
    </div>
  );
};
