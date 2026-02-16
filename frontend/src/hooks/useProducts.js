import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetPublicCategoriesQuery,
  useGetPublicCollectionsQuery,
  useGetPublicColorsQuery,
  useGetPublicSkillLevelsQuery,
} from "@/redux/api/publicApi";
import { PRICE_RANGES, DEFAULT_SORT } from "@/constant/filterOptions";
import { useCarousel } from "./useCarousel";
import {
  getProductDisplayInfo,
  parseArrayParam,
  toggleArrayItem,
  toggleSetItem,
} from "@/utils/formatting";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

const DEFAULT_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const useProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // UI state for filter expansion
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedCollections, setExpandedCollections] = useState(new Set());

  // Parse URL params
  const page = parseInt(searchParams.get("page") || DEFAULT_PAGE, 10);
  const limit = parseInt(searchParams.get("limit") || DEFAULT_LIMIT, 10);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || DEFAULT_SORT;
  const priceRange = searchParams.get("priceRange") || "";
  const categoryIds = parseArrayParam(searchParams.get("categoryIds"));
  const subCategoryIds = parseArrayParam(searchParams.get("subCategoryIds"));
  const collectionIds = parseArrayParam(searchParams.get("collectionIds"));
  const subCollectionIds = parseArrayParam(
    searchParams.get("subCollectionIds"),
  );
  const colorIds = parseArrayParam(searchParams.get("colorIds"));
  const skillLevelIds = parseArrayParam(searchParams.get("skillLevelIds"));

  // Calculate price range
  const priceParams = useMemo(() => {
    if (!priceRange) return { priceMin: null, priceMax: null };
    const range = PRICE_RANGES.find((r) => r.value === priceRange);
    if (!range) return { priceMin: null, priceMax: null };
    return {
      priceMin: range.min,
      priceMax: range.max,
    };
  }, [priceRange]);

  // Build query params for API
  const queryParams = useMemo(() => {
    const buildArrayParam = (arr) => (arr.length > 0 ? arr : undefined);

    return {
      page,
      limit,
      search: search || undefined,
      sortBy,
      ...priceParams,
      categoryIds: buildArrayParam(categoryIds),
      subCategoryIds: buildArrayParam(subCategoryIds),
      collectionIds: buildArrayParam(collectionIds),
      subCollectionIds: buildArrayParam(subCollectionIds),
      colorIds: buildArrayParam(colorIds),
      skillLevelIds: buildArrayParam(skillLevelIds),
    };
  }, [
    page,
    limit,
    search,
    sortBy,
    priceParams,
    categoryIds,
    subCategoryIds,
    collectionIds,
    subCollectionIds,
    colorIds,
    skillLevelIds,
  ]);

  // Fetch products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery(queryParams, {
    skip: false,
  });

  // Fetch filter options
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetPublicCategoriesQuery();
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useGetPublicCollectionsQuery();
  const { data: colorsData, isLoading: isLoadingColors } =
    useGetPublicColorsQuery();
  const { data: skillLevelsData, isLoading: isLoadingSkillLevels } =
    useGetPublicSkillLevelsQuery();

  // Update URL params helper
  const updateSearchParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(","));
        } else {
          newParams.set(key, String(value));
        }
      });

      // Reset to page 1 when filters change (except when explicitly setting page)
      if (!updates.hasOwnProperty("page")) {
        newParams.set("page", "1");
      }

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Generic filter toggle handler factory
  const createFilterToggleHandler = useCallback(
    (currentIds, paramKey) => (id) => {
      const newIds = toggleArrayItem(currentIds, id);
      updateSearchParams({ [paramKey]: newIds });
    },
    [updateSearchParams],
  );

  // Filter handlers
  const handlePriceRangeChange = useCallback(
    (rangeValue) => {
      updateSearchParams({ priceRange: rangeValue || null, page: 1 });
    },
    [updateSearchParams],
  );

  const handleCategoryToggle = useMemo(
    () => createFilterToggleHandler(categoryIds, "categoryIds"),
    [categoryIds, createFilterToggleHandler],
  );

  const handleSubCategoryToggle = useMemo(
    () => createFilterToggleHandler(subCategoryIds, "subCategoryIds"),
    [subCategoryIds, createFilterToggleHandler],
  );

  const handleCollectionToggle = useMemo(
    () => createFilterToggleHandler(collectionIds, "collectionIds"),
    [collectionIds, createFilterToggleHandler],
  );

  const handleSubCollectionToggle = useMemo(
    () => createFilterToggleHandler(subCollectionIds, "subCollectionIds"),
    [subCollectionIds, createFilterToggleHandler],
  );

  const handleColorToggle = useMemo(
    () => createFilterToggleHandler(colorIds, "colorIds"),
    [colorIds, createFilterToggleHandler],
  );

  const handleSkillLevelToggle = useMemo(
    () => createFilterToggleHandler(skillLevelIds, "skillLevelIds"),
    [skillLevelIds, createFilterToggleHandler],
  );

  const handleSortChange = useCallback(
    (newSortBy) => {
      updateSearchParams({ sortBy: newSortBy });
    },
    [updateSearchParams],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      updateSearchParams({ page: newPage });
    },
    [updateSearchParams],
  );

  const handleSearchChange = useCallback(
    (searchValue) => {
      updateSearchParams({ search: searchValue || null, page: 1 });
    },
    [updateSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const products = useMemo(() => {
    const rawProducts = Array.isArray(productsData?.products)
      ? productsData.products
      : [];
    return rawProducts.map((product) => ({
      ...product,
      ...getProductDisplayInfo(product),
    }));
  }, [productsData?.products]);

  const pagination = productsData?.pagination || DEFAULT_PAGINATION;

  // Extract data from API responses with fallback
  const extractData = (data, key) =>
    Array.isArray(data?.[key]) ? data[key] : [];
  const categories = extractData(categoriesData, "categories");
  const collections = extractData(collectionsData, "collections");
  const colors = extractData(colorsData, "colors");
  const skillLevels = extractData(skillLevelsData, "skillLevels");

  const isLoading =
    isLoadingProducts ||
    isLoadingCategories ||
    isLoadingCollections ||
    isLoadingColors ||
    isLoadingSkillLevels;

  // Calculate pagination display values
  const startItem = useMemo(() => {
    if (pagination.totalItems === 0) return 0;
    return pagination.page > 0
      ? (pagination.page - 1) * pagination.limit + 1
      : 0;
  }, [pagination.page, pagination.limit, pagination.totalItems]);

  const endItem = useMemo(() => {
    return Math.min(pagination.page * pagination.limit, pagination.totalItems);
  }, [pagination.page, pagination.limit, pagination.totalItems]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      priceRange ||
      categoryIds.length > 0 ||
      subCategoryIds.length > 0 ||
      collectionIds.length > 0 ||
      subCollectionIds.length > 0 ||
      colorIds.length > 0 ||
      skillLevelIds.length > 0
    );
  }, [
    priceRange,
    categoryIds,
    subCategoryIds,
    collectionIds,
    subCollectionIds,
    colorIds,
    skillLevelIds,
  ]);

  // Generic expansion handler factory
  const createExpansionHandler = useCallback(
    (setter) => (id) => {
      setter((prev) => toggleSetItem(prev, id));
    },
    [],
  );

  // Filter expansion handlers
  const handleCategoryExpansion = useMemo(
    () => createExpansionHandler(setExpandedCategories),
    [createExpansionHandler],
  );

  const handleCollectionExpansion = useMemo(
    () => createExpansionHandler(setExpandedCollections),
    [createExpansionHandler],
  );

  // Pagination logic
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;
    const { totalPages, page: currentPage } = pagination;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push("...");
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [pagination]);

  const handlePreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      handlePageChange(pagination.page - 1);
    }
  }, [pagination.page, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      handlePageChange(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, handlePageChange]);

  const handlePageNumberClick = useCallback(
    (pageNumber) => {
      if (
        pageNumber >= 1 &&
        pageNumber <= pagination.totalPages &&
        pageNumber !== pagination.page
      ) {
        handlePageChange(pageNumber);
      }
    },
    [pagination.page, pagination.totalPages, handlePageChange],
  );

  // Computed display values
  const hasProducts = products.length > 0;
  const showPagination = !isLoading && hasProducts && pagination.totalPages > 1;
  const showEmptyState = !isLoading && !hasProducts;
  const isFirstPage = pagination.page === 1;
  const isLastPage = pagination.page >= pagination.totalPages;

  return {
    // Data
    products,
    pagination,
    categories,
    collections,
    colors,
    skillLevels,

    // State
    page,
    limit,
    search,
    sortBy,
    priceRange,
    categoryIds,
    subCategoryIds,
    collectionIds,
    subCollectionIds,
    colorIds,
    skillLevelIds,
    expandedCategories,
    expandedCollections,

    // Computed values
    startItem,
    endItem,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    hasActiveFilters,
    pageNumbers: getPageNumbers(),
    hasProducts,
    showPagination,
    showEmptyState,
    isFirstPage,
    isLastPage,

    // Loading & Error
    isLoading,
    error: productsError,

    // Filter handlers
    handlePriceRangeChange,
    handleCategoryToggle,
    handleSubCategoryToggle,
    handleCollectionToggle,
    handleSubCollectionToggle,
    handleColorToggle,
    handleSkillLevelToggle,
    handleCategoryExpansion,
    handleCollectionExpansion,

    // Sort & Search handlers
    handleSortChange,
    handleSearchChange,

    // Pagination handlers
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handlePageNumberClick,

    // Other handlers
    handleClearFilters,
  };
};

// Hook for individual product card logic
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

// Per-card hover image cycling
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
    // Start cycling immediately without delay
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

// ------------------------------------ Product Details Page ---------------------------------------------
export const useProductDetails = (id) => {
  const {
    data: productData,
    isLoading,
    error,
  } = useGetProductByIdQuery(id, {
    skip: !id,
  });

  const product = productData?.product;
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

  // Scroll thumbnail into view when selected index changes (from navigation or color click)
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
    // For variant products, default to first variant (index 0)
    // For standalone products, set to null
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

    // For standalone products, stock is at product level
    if (product.productType === "standalone") {
      return product.stock;
    }

    // For variant products, get stock from selected variant
    if (product.productType === "variant" && product.variants?.length > 0) {
      // Use selected variant index (defaults to 0 for variant products)
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

  // Get stock alert info (status, color, message)
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

  // Get partId and itemId based on product type and selected variant
  const currentPartId = useMemo(() => {
    if (!product) return null;

    // partId is at product level for both standalone and variant products
    return product.partId || null;
  }, [product]);

  const currentItemId = useMemo(() => {
    if (!product) return null;

    // For standalone products, itemId is at product level
    if (product.productType === "standalone") {
      return product.itemId || null;
    }

    // For variant products, get itemId from selected variant
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

  // Description array
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

// ------------------------------------ Latest Products -------------------------------------
export const useLatestProducts = ({ limit = 12 } = {}) => {
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery(
    {
      page: 1,
      limit,
      sortBy: "date_desc", // Latest products: newest to oldest
    },
    {
      skip: false,
    },
  );

  const products = useMemo(() => {
    const rawProducts = Array.isArray(productsData?.products)
      ? productsData.products
      : [];
    return rawProducts.map((product) => ({
      ...product,
      ...getProductDisplayInfo(product),
    }));
  }, [productsData?.products]);

  const { setApi, canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
    useCarousel({
      autoScroll: false, // No auto-scroll for latest products
      itemCount: products.length,
    });

  const hasProducts = products.length > 0;
  const isError = Boolean(error);

  return {
    products,
    isLoading,
    isError,
    hasProducts,
    setApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  };
};
