import React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MediaUpload = ({
  label = "Media",
  mediaType = "image",
  accept = "image/*,video/*",
  multiple = false,
  description = "Image, GIF, or Video",
  containerClassName = "h-full",
  preview,
  onChange,
  onRemove,
  children,
}) => {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {preview ? (
        <div
          className={`relative rounded-lg overflow-hidden group ${containerClassName}`}
        >
          {mediaType === "video" ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          )}

          {children}

          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Label
          className={`border-2 border-dashed rounded-md p-5 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center ${containerClassName}`}
        >
          <Upload className="size-8 text-muted-foreground mb-2" />

          <p className="text-sm text-muted-foreground font-bold">
            Click to upload
          </p>

          <p className="text-xs text-muted-foreground">{description}</p>

          <Input
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={onChange}
          />
        </Label>
      )}
    </div>
  );
};

export default MediaUpload;
