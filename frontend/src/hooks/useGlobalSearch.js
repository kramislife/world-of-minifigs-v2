import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUCT_FILTERS } from "@/constant/productFilters";
import { useGlobalSearchQuery } from "@/redux/api/publicApi";

//------------------------------------------------ Constants ------------------------------------------

const DEBOUNCE_MS = 400;
const MIN_SEARCH_LENGTH = 2;

// Maps backend results keys to filter configurations. 'products' is handled separately in logic.

const CATEGORY_CONFIG = {
  products: {
    label: "Products",
    urlKey: null,
  },
  categories: PRODUCT_FILTERS.CATEGORIES,
  subCategories: PRODUCT_FILTERS.SUB_CATEGORIES,
  collections: PRODUCT_FILTERS.COLLECTIONS,
  subCollections: PRODUCT_FILTERS.SUB_COLLECTIONS,
  colors: PRODUCT_FILTERS.COLORS,
  skillLevels: PRODUCT_FILTERS.SKILL_LEVELS,
};

//------------------------------------------------ Hook ------------------------------------------

export const useGlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (searchTerm.length >= MIN_SEARCH_LENGTH) {
      debounceTimer.current = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, DEBOUNCE_MS);
    } else {
      setDebouncedSearch("");
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset search when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setDebouncedSearch("");
    }
  }, [isOpen]);

  // API query — only fires when debouncedSearch has a value
  const { data, isLoading, isFetching } = useGlobalSearchQuery(
    debouncedSearch,
    { skip: debouncedSearch.length < MIN_SEARCH_LENGTH },
  );

  const results = data?.results || {};

  // Categories that should not display an image thumbnail
  const HIDDEN_IMAGE_KEYS = new Set(["colors", "collections"]);

  // Pre-process and categorize results for display
  const categorizedResults = useMemo(() => {
    const categories = [];

    for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
      const rawItems = results[key];
      if (!rawItems?.length) continue;

      let items;

      if (key === "products") {
        // Pre-process products with display-ready price and color data
        items = rawItems.map((item) => {
          const price = Number(item.price).toFixed(2);
          const discountPrice = item.discountPrice
            ? Number(item.discountPrice).toFixed(2)
            : null;
          const hasDiscount = discountPrice !== null;
          const colorDisplay = item.colorName
            ? item.secondaryColorName
              ? `${item.colorName} / ${item.secondaryColorName}`
              : item.colorName
            : null;

          return {
            ...item,
            displayPrice: hasDiscount ? discountPrice : price,
            originalPrice: price,
            hasDiscount,
            colorDisplay,
          };
        });
      } else {
        // Pre-process filters with display-ready name and image visibility
        items = rawItems.map((item) => ({
          ...item,
          displayName: item[config.displayField],
          showImage: !HIDDEN_IMAGE_KEYS.has(key),
        }));
      }

      categories.push({ key, label: config.label, items });
    }

    return categories;
  }, [results]);

  const hasResults = categorizedResults.length > 0;
  const hasSearched = debouncedSearch.length >= MIN_SEARCH_LENGTH;

  // Handle selecting a result — navigates to the appropriate page
  const handleSelect = useCallback(
    (categoryKey, item) => {
      const config = CATEGORY_CONFIG[categoryKey];

      if (categoryKey === "products") {
        navigate(`/products/${item._id}`);
      } else if (config.urlKey) {
        const params = new URLSearchParams();
        params.set(config.urlKey, item._id);
        navigate(`/products?${params.toString()}`);
      }

      onClose?.();
    },
    [navigate, onClose],
  );

  // Submit search — navigates to products page with text query
  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim().length >= MIN_SEARCH_LENGTH) {
      const params = new URLSearchParams();
      params.set("search", searchTerm.trim());
      navigate(`/products?${params.toString()}`);

      onClose?.();
    }
  }, [searchTerm, navigate, onClose]);

  // Handle keyboard events for the search input
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit],
  );

  return {
    searchTerm,
    setSearchTerm,
    isLoading: isLoading || isFetching,
    categorizedResults,
    hasResults,
    hasSearched,
    handleSelect,
    handleKeyDown,
    inputRef,
  };
};
