import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/assets/media/Logo.png";
import { useProductDetails } from "@/hooks/useProducts";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    product,
    isLoading,
    error,
    allImages,
    currentImageUrl,
    features,
    colorVariants,
    thumbnailScrollRef,
    displayPrice,
    hasDiscount,
    stockAlert,
    currentPartId,
    hasPartId,
    currentItemId,
    hasItemId,
    descriptions,
    hasDescriptions,
    hasMultipleImages,
    hasFeatures,
    hasColorVariants,
    isThumbnailSelected,
    isColorVariantSelected,
    handleThumbnailClick,
    handlePreviousImage,
    handleNextImage,
    handleColorVariantClick,
  } = useProductDetails(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-5">
        <p className="text-lg font-medium text-destructive mb-2">
          Product not found
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.data?.message ||
            "The product you're looking for doesn't exist."}
        </p>
        <Button onClick={() => navigate("/products")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column - Images */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Main Image */}
          <div className="relative flex-1 aspect-square border-4 border-border rounded-lg overflow-hidden group order-1 lg:order-2">
            {currentImageUrl ? (
              <>
                <img
                  src={currentImageUrl}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />

                {/* Discount Badge */}
                {product.discount && (
                  <Badge
                    variant="accent"
                    className="absolute top-4 right-4 z-10"
                  >
                    {product.discount}% OFF
                  </Badge>
                )}

                {/* Item ID */}
                {hasItemId && (
                  <span className="absolute bottom-3 right-3 z-10 text-sm">
                    # {currentItemId}
                  </span>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="size-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="size-5" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <img
                  src={Logo}
                  alt="Product placeholder"
                  className="max-h-56 max-w-56 object-contain opacity-80"
                />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {hasMultipleImages && (
            <div
              ref={thumbnailScrollRef}
              className="flex lg:flex-col gap-2 overflow-y-auto lg:h-[620px] order-2 lg:order-1"
            >
              {allImages.map((img, index) => (
                <Button
                  key={`${img.url}-${index}`}
                  variant="ghost"
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative w-28 h-28 border-4 transition-all p-0 hover:bg-transparent ${
                    isThumbnailSelected(index)
                      ? "border-accent"
                      : "border-border hover:border-destructive"
                  }`}
                >
                  <img
                    src={img.url || Logo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="flex items-center">
          <div className="space-y-5 w-full">
            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold mb-3">
                {product.productName}
                {hasPartId && (
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    #{currentPartId}
                  </span>
                )}
              </h1>
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-xs text-primary leading-none">(0)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-5xl font-bold text-success dark:text-accent">
                ${displayPrice?.toFixed(2) || "0.00"}
              </span>
              {hasDiscount && product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Alert */}
            {stockAlert && (
              <div className="flex items-center gap-2 relative">
                <span
                  className={`w-2 h-2 rounded-full ${stockAlert.dotColor} animate-ping absolute`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${stockAlert.dotColor}`}
                />
                <span className={`text-sm font-medium ${stockAlert.textColor}`}>
                  {stockAlert.message}
                </span>
              </div>
            )}

            {/* Features & Classifications */}
            {hasFeatures && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Features & Classifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {features.categories.map((cat, index) => (
                    <Badge
                      key={`cat-${index}`}
                      variant="outline"
                      className="px-3 py-1"
                    >
                      {cat.name}
                    </Badge>
                  ))}
                  {features.collections.map((col, index) => (
                    <Badge
                      key={`col-${index}`}
                      variant="outline"
                      className="px-3 py-1"
                    >
                      {col.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Minifig Guide and Instructions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Includes</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <Badge variant="outline" className="px-3 py-1">
                  Minifig Guide and Instructions
                </Badge>
              </div>
            </div>

            {/* Color Variants / Color */}
            {hasColorVariants && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  {product.productType === "standalone"
                    ? "Color"
                    : "Color Variants"}
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {product.productType === "standalone" ? (
                    // Standalone product - show single color as indicator
                    <div className="flex items-center gap-2">
                      <span
                        className="size-6 rounded-full border-2 border-border"
                        style={{
                          backgroundColor: colorVariants[0]?.hexCode || "#ccc",
                        }}
                      />
                      <span className="text-sm">
                        {colorVariants[0]?.colorName}
                      </span>
                    </div>
                  ) : (
                    // Variant product - show clickable color options
                    colorVariants.map((variant, index) => (
                      <Button
                        key={variant.colorId}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleColorVariantClick(index)}
                        className={`relative size-6 rounded-full border-2 transition-all p-0 hover:bg-transparent ${
                          isColorVariantSelected(index)
                            ? "border-accent"
                            : "border-border hover:border-destructive"
                        }`}
                        style={{
                          backgroundColor: variant.hexCode || "#ccc",
                        }}
                        title={variant.colorName}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {hasDescriptions && (
              <div className="space-y-2 text-sm">
                {descriptions.map((description, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1">Add to Cart</Button>
              <Button variant="accent" className="flex-1">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
