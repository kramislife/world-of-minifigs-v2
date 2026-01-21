import { useMemo, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetProductsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicCollectionsQuery,
  useGetPublicColorsQuery,
  useGetPublicSkillLevelsQuery,
} from "@/redux/api/publicApi";
import { PRICE_RANGES, DEFAULT_SORT } from "@/constant/filterOptions";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

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
  const categoryIds = searchParams.get("categoryIds")?.split(",").filter(Boolean) || [];
  const subCategoryIds = searchParams.get("subCategoryIds")?.split(",").filter(Boolean) || [];
  const collectionIds = searchParams.get("collectionIds")?.split(",").filter(Boolean) || [];
  const subCollectionIds = searchParams.get("subCollectionIds")?.split(",").filter(Boolean) || [];
  const colorIds = searchParams.get("colorIds")?.split(",").filter(Boolean) || [];
  const skillLevelIds = searchParams.get("skillLevelIds")?.split(",").filter(Boolean) || [];

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
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      sortBy,
      ...priceParams,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      subCategoryIds: subCategoryIds.length > 0 ? subCategoryIds : undefined,
      collectionIds: collectionIds.length > 0 ? collectionIds : undefined,
      subCollectionIds: subCollectionIds.length > 0 ? subCollectionIds : undefined,
      colorIds: colorIds.length > 0 ? colorIds : undefined,
      skillLevelIds: skillLevelIds.length > 0 ? skillLevelIds : undefined,
    }),
    [
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
    ]
  );

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
        if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
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
    [searchParams, setSearchParams]
  );

  // Filter handlers
  const handlePriceRangeChange = useCallback(
    (rangeValue) => {
      updateSearchParams({ priceRange: rangeValue || null, page: 1 });
    },
    [updateSearchParams]
  );

  const handleCategoryToggle = useCallback(
    (categoryId) => {
      const newCategoryIds = categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId];
      updateSearchParams({ categoryIds: newCategoryIds });
    },
    [categoryIds, updateSearchParams]
  );

  const handleSubCategoryToggle = useCallback(
    (subCategoryId) => {
      const newSubCategoryIds = subCategoryIds.includes(subCategoryId)
        ? subCategoryIds.filter((id) => id !== subCategoryId)
        : [...subCategoryIds, subCategoryId];
      updateSearchParams({ subCategoryIds: newSubCategoryIds });
    },
    [subCategoryIds, updateSearchParams]
  );

  const handleCollectionToggle = useCallback(
    (collectionId) => {
      const newCollectionIds = collectionIds.includes(collectionId)
        ? collectionIds.filter((id) => id !== collectionId)
        : [...collectionIds, collectionId];
      updateSearchParams({ collectionIds: newCollectionIds });
    },
    [collectionIds, updateSearchParams]
  );

  const handleSubCollectionToggle = useCallback(
    (subCollectionId) => {
      const newSubCollectionIds = subCollectionIds.includes(subCollectionId)
        ? subCollectionIds.filter((id) => id !== subCollectionId)
        : [...subCollectionIds, subCollectionId];
      updateSearchParams({ subCollectionIds: newSubCollectionIds });
    },
    [subCollectionIds, updateSearchParams]
  );

  const handleColorToggle = useCallback(
    (colorId) => {
      const newColorIds = colorIds.includes(colorId)
        ? colorIds.filter((id) => id !== colorId)
        : [...colorIds, colorId];
      updateSearchParams({ colorIds: newColorIds });
    },
    [colorIds, updateSearchParams]
  );

  const handleSkillLevelToggle = useCallback(
    (skillLevelId) => {
      const newSkillLevelIds = skillLevelIds.includes(skillLevelId)
        ? skillLevelIds.filter((id) => id !== skillLevelId)
        : [...skillLevelIds, skillLevelId];
      updateSearchParams({ skillLevelIds: newSkillLevelIds });
    },
    [skillLevelIds, updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortBy) => {
      updateSearchParams({ sortBy: newSortBy });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      updateSearchParams({ page: newPage });
    },
    [updateSearchParams]
  );

  const handleSearchChange = useCallback(
    (searchValue) => {
      updateSearchParams({ search: searchValue || null, page: 1 });
    },
    [updateSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Utility functions for product data processing
  const getProductImageUrl = useCallback((product) => {
    if (product.productType === "standalone") {
      return product.images?.[0]?.url || null;
    }
    if (product.productType === "variant") {
      return product.variants?.[0]?.image?.url || null;
    }
    return null;
  }, []);

  const getProductDisplayPrice = useCallback((product) => {
    return product.discountPrice ?? product.price;
  }, []);

  const hasProductDiscount = useCallback((product) => {
    return Boolean(product.discountPrice);
  }, []);

  // Process products to include computed fields
  const products = useMemo(() => {
    const rawProducts = productsData?.products || [];
    return rawProducts.map((product) => ({
      ...product,
      imageUrl: getProductImageUrl(product),
      displayPrice: getProductDisplayPrice(product),
      hasDiscount: hasProductDiscount(product),
    }));
  }, [productsData?.products, getProductImageUrl, getProductDisplayPrice, hasProductDiscount]);

  const pagination = productsData?.pagination || {
    page: 1,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const categories = categoriesData?.categories || [];
  const collections = collectionsData?.collections || [];
  const colors = colorsData?.colors || [];
  const skillLevels = skillLevelsData?.skillLevels || [];

  const isLoading =
    isLoadingProducts ||
    isLoadingCategories ||
    isLoadingCollections ||
    isLoadingColors ||
    isLoadingSkillLevels;

  // Calculate pagination display values
  const startItem = useMemo(() => {
    if (pagination.totalItems === 0) return 0;
    return pagination.page > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
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

  // Filter expansion handlers
  const handleCategoryExpansion = useCallback((categoryId) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  }, []);

  const handleCollectionExpansion = useCallback((collectionId) => {
    setExpandedCollections((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(collectionId)) {
        newExpanded.delete(collectionId);
      } else {
        newExpanded.add(collectionId);
      }
      return newExpanded;
    });
  }, []);

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
    [pagination.page, pagination.totalPages, handlePageChange]
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

