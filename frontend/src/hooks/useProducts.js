import { useMemo, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetProductsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicCollectionsQuery,
  useGetPublicColorsQuery,
  useGetPublicSkillLevelsQuery,
} from "@/redux/api/publicApi";
import {
  PRODUCT_FILTERS,
  FILTER_KEYS,
  PRICE_RANGES,
  DEFAULT_SORT,
} from "@/constant/productFilters";
import {
  parseArrayParam,
  toggleArrayItem,
  toggleSetItem,
} from "@/utils/formatting";
import { useProcessedProducts } from "./useLatestProducts";

// --------------------------------------------------------------- Constants ----------------------------------------------------
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

const INITIAL_PAGINATION = {
  page: 1,
  limit: DEFAULT_LIMIT,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

// --------------------------------------------------------------- Hook ----------------------------------------------------

export const useProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // UI state for filter expansion
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedCollections, setExpandedCollections] = useState(new Set());

  // 1. DYNAMIC FILTER PARSING
  const filters = useMemo(() => {
    const state = {};
    Object.values(PRODUCT_FILTERS).forEach(({ id, urlKey, isArray }) => {
      const val = searchParams.get(urlKey);
      state[id] = isArray ? parseArrayParam(val) : val || "";
    });
    return state;
  }, [searchParams]);

  // Non-dynamic params
  const page = parseInt(searchParams.get("page") || DEFAULT_PAGE, 10);
  const limit = parseInt(searchParams.get("limit") || DEFAULT_LIMIT, 10);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || DEFAULT_SORT;

  // Calculate price range for backend
  const priceParams = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.value === filters.priceRange);
    return range
      ? { priceMin: range.min, priceMax: range.max }
      : { priceMin: null, priceMax: null };
  }, [filters.priceRange]);

  // 2. QUERY BUILDING
  const queryParams = useMemo(() => {
    const buildArrayParam = (arr) => (arr?.length > 0 ? arr : undefined);
    const params = {
      page,
      limit,
      search: search || undefined,
      sortBy,
      ...priceParams,
    };

    // Add array filters to query
    Object.values(PRODUCT_FILTERS).forEach(({ id, isArray }) => {
      if (isArray) {
        params[id] = buildArrayParam(filters[id]);
      }
    });

    return params;
  }, [page, limit, search, sortBy, filters, priceParams]);

  // 3. DATA FETCHING
  const {
    currentData: productsData,
    isLoading: isQueryLoading,
    isFetching,
    error: productsError,
  } = useGetProductsQuery(queryParams);

  const isLoadingProducts = isQueryLoading || isFetching;

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetPublicCategoriesQuery();
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useGetPublicCollectionsQuery();
  const { data: colorsData, isLoading: isLoadingColors } =
    useGetPublicColorsQuery();
  const { data: skillLevelsData, isLoading: isLoadingSkillLevels } =
    useGetPublicSkillLevelsQuery();

  // 4. NAVIGATION & HANDLERS
  const updateSearchParams = useCallback(
    (updates) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(","));
        } else {
          newParams.set(key, String(value));
        }
      });

      if (!updates.hasOwnProperty("page")) newParams.set("page", "1");
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Generic filter toggle handler
  const handleFilterToggle = useCallback(
    (id, value) => {
      const filterConfig = Object.values(PRODUCT_FILTERS).find(
        (f) => f.id === id,
      );
      if (!filterConfig) return;

      if (filterConfig.isArray) {
        const newIds = toggleArrayItem(filters[id], value);
        updateSearchParams({ [filterConfig.urlKey]: newIds });
      } else {
        updateSearchParams({
          [filterConfig.urlKey]: filters[id] === value ? null : value,
        });
      }
    },
    [filters, updateSearchParams],
  );

  // Specific handlers (still exposed for component compatibility)
  const handlePriceRangeChange = (val) =>
    handleFilterToggle(PRODUCT_FILTERS.PRICE_RANGE.id, val);
  const handleCategoryToggle = (id) =>
    handleFilterToggle(PRODUCT_FILTERS.CATEGORIES.id, id);
  const handleSubCategoryToggle = (id) =>
    handleFilterToggle(PRODUCT_FILTERS.SUB_CATEGORIES.id, id);
  const handleCollectionToggle = (id) =>
    handleFilterToggle(PRODUCT_FILTERS.COLLECTIONS.id, id);
  const handleSubCollectionToggle = (id) =>
    handleFilterToggle(PRODUCT_FILTERS.SUB_COLLECTIONS.id, id);
  const handleColorToggle = (id) =>
    handleFilterToggle(PRODUCT_FILTERS.COLORS.id, id);
  const handleSkillLevelToggle = (id) =>
    handleFilterToggle(PRODUCT_FILTERS.SKILL_LEVELS.id, id);

  const handleSortChange = (newSortBy) =>
    updateSearchParams({ sortBy: newSortBy });
  const handlePageChange = (newPage) => updateSearchParams({ page: newPage });
  const handleClearFilters = () =>
    setSearchParams(new URLSearchParams(), { replace: true });

  // 5. COMPUTED VALUES
  const products = useProcessedProducts(productsData);
  const pagination = productsData?.pagination || INITIAL_PAGINATION;

  const extractData = (data, key) =>
    Array.isArray(data?.[key]) ? data[key] : [];
  const categories = extractData(categoriesData, "categories");
  const collections = extractData(collectionsData, "collections");
  const colors = extractData(colorsData, "colors");
  const skillLevels = extractData(skillLevelsData, "skillLevels");

  const hasActiveFilters = useMemo(() => {
    return FILTER_KEYS.some((key) => {
      const val = filters[key];
      return Array.isArray(val) ? val.length > 0 : !!val;
    });
  }, [filters]);

  const handleCategoryExpansion = (id) =>
    setExpandedCategories((prev) => toggleSetItem(prev, id));
  const handleCollectionExpansion = (id) =>
    setExpandedCollections((prev) => toggleSetItem(prev, id));

  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;
    const { totalPages, page: currentPage } = pagination;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1)
        start = Math.max(1, end - maxVisible + 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  }, [pagination]);

  return {
    products,
    pagination,
    categories,
    collections,
    colors,
    skillLevels,
    page,
    limit,
    search,
    sortBy,
    ...filters, // categoriesId, etc.
    expandedCategories,
    expandedCollections,
    startItem:
      pagination.totalItems === 0
        ? 0
        : (pagination.page - 1) * pagination.limit + 1,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    hasActiveFilters,
    pageNumbers: getPageNumbers(),
    hasProducts: products.length > 0,
    showPagination:
      !isLoadingProducts && products.length > 0 && pagination.totalPages > 1,
    isFirstPage: pagination.page === 1,
    isLastPage: pagination.page >= pagination.totalPages,
    isLoading:
      isLoadingProducts ||
      isLoadingCategories ||
      isLoadingCollections ||
      isLoadingColors ||
      isLoadingSkillLevels,
    isError: Boolean(productsError),
    handleFilterToggle,
    handlePriceRangeChange,
    handleCategoryToggle,
    handleSubCategoryToggle,
    handleCollectionToggle,
    handleSubCollectionToggle,
    handleColorToggle,
    handleSkillLevelToggle,
    handleCategoryExpansion,
    handleCollectionExpansion,
    handleSortChange,
    handlePageChange,
    handlePreviousPage: () => page > 1 && handlePageChange(page - 1),
    handleNextPage: () =>
      page < pagination.totalPages && handlePageChange(page + 1),
    handlePageNumberClick: (n) => n !== "..." && handlePageChange(n),
    handleClearFilters,
  };
};
