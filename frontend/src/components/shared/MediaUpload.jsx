import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CommonImage from "@/components/shared/CommonImage";

const MediaItem = React.memo(
  ({
    item,
    index,
    onRemove,
    renderItem,
    disabled,
    previewClassName,
    imageClassName,
    mediaType,
  }) => (
    <div className="relative group rounded-md border flex flex-col">
      <div className={`relative w-full ${previewClassName}`}>
        {mediaType === "video" ? (
          <video
            src={item.url}
            className={`w-full h-full ${imageClassName}`}
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <CommonImage
            src={item.url}
            alt="preview"
            className="w-full h-full"
            objectFit={imageClassName}
          />
        )}
        {!disabled && (
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50"
            onClick={() => onRemove?.(index)}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      {renderItem?.(item, index)}
    </div>
  ),
);

const MediaUpload = ({
  label,
  mediaType = "image",
  accept = "image/*",
  multiple = false,
  description = "Image, GIF, or Video",
  previewClassName = "aspect-4/3",
  imageClassName = "object-cover",
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

  // Calculate the grid structure
  // Always reserve a slot for the upload box in multi-mode to keep layout stable
  const totalItemsCount = isMulti ? previews.length + 1 : 1;
  const gridConfig = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  const gridCols = gridConfig[Math.min(totalItemsCount, 4)] || "grid-cols-1";

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
      <input
        ref={inputRef}
        id="media-upload"
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
        <Label htmlFor="media-upload">
          {label}
          {fileCountLabel}
        </Label>
      )}

      <div className={isMulti ? `grid gap-2 ${gridCols}` : ""}>
        {isMulti
          ? previews.map((item, index) => (
              <MediaItem
                key={index}
                item={item}
                index={index}
                onRemove={onRemove}
                renderItem={renderItem}
                disabled={disabled}
                previewClassName={previewClassName}
                imageClassName={imageClassName}
                mediaType={mediaType}
              />
            ))
          : hasPreview && (
              <div className="relative group rounded-md border flex flex-col">
                <div className={`relative w-full ${previewClassName}`}>
                  {mediaType === "video" ? (
                    <video
                      src={preview}
                      className={`w-full h-full ${imageClassName}`}
                      muted
                      playsInline
                      autoPlay
                      loop
                    />
                  ) : (
                    <CommonImage
                      src={preview}
                      alt="preview"
                      className="w-full h-full"
                      objectFit={imageClassName}
                    />
                  )}
                  {!disabled && (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                      onClick={onRemove}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
                {renderItem
                  ? renderItem(
                      isMulti ? item : previews[0] || { url: preview },
                      0,
                    )
                  : children}
              </div>
            )}

        {(isMulti || !hasPreview) && <UploadTrigger />}
      </div>
    </div>
  );
};

export default MediaUpload;
