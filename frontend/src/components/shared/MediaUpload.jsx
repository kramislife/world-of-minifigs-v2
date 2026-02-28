import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MediaUpload = ({
  label,
  mediaType = "image",
  accept = "image/*",
  multiple = false,
  description = "Image, GIF, or Video",
  previewClassName = "",
  imageClassName = "h-full object-cover",
  preview,
  onChange,
  onRemove,
  previews = [],
  children,
  renderItem,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const isMulti = multiple && Array.isArray(previews);
  const hasPreview = isMulti ? previews.length > 0 : !!preview;

  const RemoveButton = ({ onClick }) => (
    <Button
      type="button"
      size="icon-sm"
      variant="destructive"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50"
      onClick={onClick}
    >
      <X className="size-4" />
    </Button>
  );

  const UploadTrigger = () => (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed hover:border-primary/50 hover:bg-input/50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shadow-none p-10"
      >
        <Upload className="size-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground font-bold">
          Click to upload
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </Button>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={isMulti}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
    </>
  );

  const fileCountLabel = isMulti
    ? previews.length > 0 && (
        <span className="text-xs font-normal text-muted-foreground">
          ({previews.length} image{previews.length > 1 ? "s" : ""} attached)
        </span>
      )
    : null;

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {fileCountLabel}
        </Label>
      )}

      <div
        className={
          isMulti && hasPreview
            ? "grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : ""
        }
      >
        {isMulti
          ? previews.map((item, index) => (
              <div
                key={index}
                className="relative group rounded-md border overflow-hidden flex flex-col"
              >
                <div
                  className={`relative w-full overflow-hidden ${previewClassName}`}
                >
                  <img
                    src={item.url}
                    alt="preview"
                    className={`w-full ${imageClassName}`}
                  />
                  {!disabled && (
                    <RemoveButton onClick={() => onRemove?.(index)} />
                  )}
                </div>
                {renderItem?.(item, index)}
              </div>
            ))
          : hasPreview && (
              <div className="relative group rounded-md border overflow-hidden flex flex-col">
                <div
                  className={`relative w-full overflow-hidden ${previewClassName}`}
                >
                  {mediaType === "video" ? (
                    <video
                      src={preview}
                      className={`w-full ${imageClassName}`}
                      muted
                      playsInline
                      autoPlay
                      loop
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="preview"
                      className={`w-full ${imageClassName}`}
                    />
                  )}
                  {!disabled && <RemoveButton onClick={onRemove} />}
                </div>
                {children}
              </div>
            )}

        {(!hasPreview || isMulti) && !disabled && <UploadTrigger />}
      </div>
    </div>
  );
};

export default MediaUpload;
