import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Hook for individual product card logic, handling navigation and sold out status.
export const useProductCard = (product) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    if (product?._id) {
      navigate(`/products/${product._id}`);
    }
  }, [product?._id, navigate]);

  const isSoldOut = useMemo(() => {
    if (!product) return false;
    if (product.productType === "standalone") {
      return product.stock <= 0;
    }
    return product.variants?.every((v) => v.stock <= 0);
  }, [product]);

  return {
    handleNavigate,
    isSoldOut,
  };
};

// Hook for handling hover image cycling on product cards.
export const useProductCardHoverImages = (
  product,
  { cycleIntervalMs = 1000 } = {},
) => {
  const displayVariantIndex = product?.displayVariantIndex ?? 0;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cycleIntervalRef = useRef(null);

  // Build image URLs array, reordering to put displayVariantIndex first if applicable
  const imageUrls = useMemo(() => {
    if (product?.productType === "standalone" && product?.images?.length) {
      return product.images.map((img) => img?.url).filter(Boolean);
    }

    if (product?.productType === "variant" && product?.variants?.length) {
      const urls = product.variants
        .map((variant) => variant?.image?.url)
        .filter(Boolean);

      // If there's a specific display variant index, reorder array
      if (displayVariantIndex > 0 && displayVariantIndex < urls.length) {
        // Create a new array with display variant first, then others
        const displayUrl = urls[displayVariantIndex];
        const reorderedUrls = [
          displayUrl,
          ...urls.slice(0, displayVariantIndex),
          ...urls.slice(displayVariantIndex + 1),
        ];
        return reorderedUrls;
      }

      return urls;
    }

    return product?.imageUrl ? [product.imageUrl] : [];
  }, [product, displayVariantIndex]);

  const hasMultipleImages = imageUrls.length > 1;

  const stopImageCycling = useCallback(() => {
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
  }, []);

  const startImageCycling = useCallback(() => {
    if (!hasMultipleImages) return;
    stopImageCycling();

    // Immediately show second image on hover
    setCurrentImageIndex(1);

    cycleIntervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    }, cycleIntervalMs);
  }, [cycleIntervalMs, hasMultipleImages, imageUrls.length, stopImageCycling]);

  const handleMouseEnter = useCallback(() => {
    if (!hasMultipleImages) return;
    startImageCycling();
  }, [hasMultipleImages, startImageCycling]);

  const handleMouseLeave = useCallback(() => {
    stopImageCycling();
    setCurrentImageIndex(0);
  }, [stopImageCycling]);

  // Cleanup + reset when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    return () => {
      stopImageCycling();
    };
  }, [product?._id, stopImageCycling]);

  return {
    imageUrls,
    currentImageIndex,
    hasMultipleImages,
    handleMouseEnter,
    handleMouseLeave,
  };
};
