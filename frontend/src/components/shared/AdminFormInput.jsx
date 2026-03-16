import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Internal helper for consistent form field layout
const FormContainer = ({
  label,
  name,
  labelRight,
  className = "",
  children,
}) => (
  <div className={`space-y-2 ${className}`}>
    {(label || labelRight) && (
      <div className="flex items-center justify-between">
        {label && <Label htmlFor={name}>{label}</Label>}
        {labelRight && labelRight}
      </div>
    )}
    {children}
  </div>
);

export const AdminFormInput = ({
  label,
  name,
  labelRight,
  className,
  inputClassName,
  ...props
}) => (
  <FormContainer
    label={label}
    name={name}
    labelRight={labelRight}
    className={className}
  >
    <Input id={name} name={name} className={inputClassName} {...props} />
  </FormContainer>
);

export const AdminFormTextarea = ({
  label,
  name,
  labelRight,
  className,
  textareaClassName,
  rows = 4,
  ...props
}) => (
  <FormContainer
    label={label}
    name={name}
    labelRight={labelRight}
    className={className}
  >
    <Textarea
      id={name}
      name={name}
      rows={rows}
      className={textareaClassName}
      {...props}
    />
  </FormContainer>
);

export const AdminFormSelect = ({
  label,
  name,
  labelRight,
  value,
  onValueChange,
  options = [],
  getValue = (opt) => opt.value,
  getLabel = (opt) => opt.label,
  placeholder = "Select an option",
  className = "",
  triggerClassName = "",
  disabled = false,
  isLoading = false,
  emptyMessage = "No options available",
  renderOption,
  ...props
}) => (
  <FormContainer
    label={label}
    name={name}
    labelRight={labelRight}
    className={className}
  >
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
      name={name}
      {...props}
    >
      <SelectTrigger id={name} className={`w-full ${triggerClassName}`}>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading && (
          <div className="p-2 text-sm text-muted-foreground">Loading...</div>
        )}

        {!isLoading && options.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}

        {!isLoading &&
          options.map((option) => (
            <SelectItem key={getValue(option)} value={getValue(option)}>
              {renderOption?.(option) ?? getLabel(option)}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  </FormContainer>
);
