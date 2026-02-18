import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useGetProductByIdQuery } from "@/redux/api/publicApi";
import { getProductDisplayInfo } from "@/utils/formatting";

// Hook for managing logic on the Product Details page. Handles variant selection, image gallery navigation, quantity, and stock status.
export const useProductDetails = (id) => {
  const {
    currentData,
    isLoading: isQueryLoading,
    isFetching,
    error,
  } = useGetProductByIdQuery(id, {
    skip: !id,
  });

  const product = currentData?.product;
  const isLoading = isQueryLoading || (isFetching && product?._id !== id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const thumbnailScrollRef = useRef(null);

  const allImages = product?.allImages || [];
  const features = product?.features || { categories: [], collections: [] };
  const colorVariants = product?.colorVariants || [];

  // Get current image URL
  const currentImageUrl = useMemo(() => {
    if (allImages.length === 0) return null;
    if (selectedVariantIndex !== null && product?.productType === "variant") {
      return allImages[selectedVariantIndex]?.url || allImages[0]?.url;
    }
    return allImages[selectedImageIndex]?.url || allImages[0]?.url;
  }, [allImages, selectedImageIndex, selectedVariantIndex, product]);

  // Helper function to scroll thumbnail into view
  const scrollThumbnailIntoView = useCallback((index) => {
    if (thumbnailScrollRef.current) {
      const thumbnailElement = thumbnailScrollRef.current.children[index];
      if (thumbnailElement) {
        thumbnailElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, []);

  // Handle thumbnail click
  const handleThumbnailClick = useCallback(
    (index) => {
      const isVariant = product?.productType === "variant";
      if (isVariant) {
        setSelectedVariantIndex(index);
        setSelectedImageIndex(0);
      } else {
        setSelectedImageIndex(index);
        setSelectedVariantIndex(null);
      }

      scrollThumbnailIntoView(index);
    },
    [product?.productType, scrollThumbnailIntoView],
  );

  // Generic image navigation handler
  const navigateImage = useCallback(
    (direction) => {
      const isVariantMode =
        selectedVariantIndex !== null && product?.productType === "variant";
      const currentIndex = isVariantMode
        ? selectedVariantIndex
        : selectedImageIndex;
      const maxIndex = allImages.length - 1;

      let newIndex;
      if (direction === "prev") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      } else {
        newIndex = (currentIndex + 1) % allImages.length;
      }

      if (isVariantMode) {
        setSelectedVariantIndex(newIndex);
        setSelectedImageIndex(0);
      } else {
        setSelectedImageIndex(newIndex);
      }
    },
    [
      selectedVariantIndex,
      selectedImageIndex,
      allImages.length,
      product?.productType,
    ],
  );

  // Handle arrow navigation
  const handlePreviousImage = useCallback(
    () => navigateImage("prev"),
    [navigateImage],
  );

  const handleNextImage = useCallback(
    () => navigateImage("next"),
    [navigateImage],
  );

  // Handle color variant click
  const handleColorVariantClick = useCallback(
    (variantIndex) => {
      if (!product || product.productType !== "variant") return;

      const variant = product.variants[variantIndex];
      if (!variant) return;

      setSelectedVariantIndex(variantIndex);
      setSelectedImageIndex(0);

      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [product],
  );

  // Scroll thumbnail into view when selected index changes
  useEffect(() => {
    if (product?.productType === "variant" && selectedVariantIndex !== null) {
      scrollThumbnailIntoView(selectedVariantIndex);
    } else if (
      product?.productType === "standalone" &&
      selectedImageIndex !== null
    ) {
      scrollThumbnailIntoView(selectedImageIndex);
    }
  }, [
    selectedImageIndex,
    selectedVariantIndex,
    product?.productType,
    scrollThumbnailIntoView,
  ]);

  // Reset to first image/variant when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    if (product?.productType === "variant" && product.variants?.length > 0) {
      setSelectedVariantIndex(0);
    } else {
      setSelectedVariantIndex(null);
    }
  }, [product?._id, product?.productType]);

  // Simple display helpers
  const { displayPrice, hasDiscount } = getProductDisplayInfo(product);

  // Get stock based on product type and selected variant
  const currentStock = useMemo(() => {
    if (!product) return undefined;
    if (product.productType === "standalone") {
      return product.stock;
    }
    if (product.productType === "variant" && product.variants?.length > 0) {
      const variantIndex = selectedVariantIndex ?? 0;
      const variant = product.variants[variantIndex];
      return variant?.stock;
    }
    return undefined;
  }, [product, selectedVariantIndex]);

  // Clamp quantity when variant/stock changes
  useEffect(() => {
    if (currentStock !== undefined && quantity > currentStock) {
      setQuantity(Math.max(1, currentStock));
    }
  }, [currentStock, quantity]);

  const handleQuantityDecrement = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const handleQuantityIncrement = useCallback(() => {
    const max = currentStock ?? Infinity;
    setQuantity((q) => Math.min(max, q + 1));
  }, [currentStock]);

  // Get stock alert info
  const stockAlert = useMemo(() => {
    if (currentStock === undefined) return null;

    if (currentStock === 0) {
      return {
        dotColor: "bg-destructive",
        textColor: "text-destructive",
        message: "Out of stock",
      };
    }

    if (currentStock <= 10) {
      return {
        dotColor: "bg-primary dark:bg-accent",
        textColor: "text-primary dark:text-accent",
        message: `Hurry up, ${currentStock} stock${currentStock === 1 ? "" : "s"} left!`,
      };
    }

    return {
      dotColor: "bg-success",
      textColor: "text-success",
      message: "Available now",
    };
  }, [currentStock]);

  // Handle IDs
  const currentPartId = product?.partId || null;
  const currentItemId = useMemo(() => {
    if (!product) return null;
    if (product.productType === "standalone") {
      return product.itemId || null;
    }
    if (product.productType === "variant" && product.variants?.length > 0) {
      const variantIndex = selectedVariantIndex ?? 0;
      const variant = product.variants[variantIndex];
      return variant?.itemId || null;
    }
    return null;
  }, [product, selectedVariantIndex]);

  // Helper function to check if a thumbnail is selected
  const isThumbnailSelected = useCallback(
    (index) => {
      if (!product) return false;
      return (
        (product.productType === "variant" && selectedVariantIndex === index) ||
        (product.productType === "standalone" && selectedImageIndex === index)
      );
    },
    [product, selectedVariantIndex, selectedImageIndex],
  );

  // Helper function to check if a color variant is selected
  const isColorVariantSelected = useCallback(
    (index) => {
      return selectedVariantIndex === index;
    },
    [selectedVariantIndex],
  );

  // Computed UI values
  const hasMultipleImages = allImages.length > 1;
  const hasFeatures =
    features.categories.length > 0 || features.collections.length > 0;
  const hasColorVariants = colorVariants.length > 0;
  const hasDescriptions =
    product?.descriptions && product.descriptions.length > 0;
  const hasPartId = Boolean(currentPartId);
  const hasItemId = Boolean(currentItemId);

  const descriptions = useMemo(() => {
    if (!product || !product.descriptions) return [];
    return product.descriptions.filter((d) => d && d.trim());
  }, [product]);

  return {
    product,
    isLoading,
    error,
    allImages,
    currentImageUrl,
    features,
    colorVariants,
    selectedVariantIndex,
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
    quantity,
    handleQuantityDecrement,
    handleQuantityIncrement,
    maxQuantity: currentStock ?? Infinity,
  };
};
