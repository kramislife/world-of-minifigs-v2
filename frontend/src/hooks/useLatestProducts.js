import { useMemo } from "react";
import {
  useGetProductsQuery,
  useGetRelatedProductsQuery,
} from "@/redux/api/publicApi";
import { getProductDisplayInfo } from "@/utils/formatting";
import { useCarousel } from "@/hooks/useCarousel";

// Helper to process raw products data from API.
export const useProcessedProducts = (productsData) =>
  useMemo(() => {
    const raw = Array.isArray(productsData?.products)
      ? productsData.products
      : [];
    return raw.map((product) => ({
      ...product,
      ...getProductDisplayInfo(product),
    }));
  }, [productsData?.products]);

// Helper to manage product carousel logic.
export const useProductCarousel = (
  products,
  { autoScroll = false, autoScrollInterval = 3000 } = {},
) => {
  const carousel = useCarousel({
    autoScroll,
    autoScrollInterval,
    itemCount: products.length,
  });

  return carousel;
};

// Hook for fetching and managing latest products.
export const useLatestProducts = ({ limit = 12 } = {}) => {
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery({
    page: 1,
    limit,
    sortBy: "date_desc",
  });

  const products = useProcessedProducts(productsData);
  const carousel = useProductCarousel(products);

  return {
    products,
    isLoading,
    isError: Boolean(error),
    hasProducts: products.length > 0,
    ...carousel,
  };
};

// Helper to build "View All" link for related products based on product features.
const buildViewAllLink = (product) => {
  if (!product) return "/products";

  const params = new URLSearchParams();
  const extractIds = (items) =>
    items?.map((i) => i._id || i).filter(Boolean) || [];

  const collectionIds = extractIds(product.collectionIds);
  const subCollectionIds = extractIds(product.subCollectionIds);
  const categoryIds = extractIds(product.categoryIds);

  if (collectionIds.length > 0)
    params.set("collectionIds", collectionIds.join(","));
  if (subCollectionIds.length > 0)
    params.set("subCollectionIds", subCollectionIds.join(","));
  if (categoryIds.length > 0) params.set("categoryIds", categoryIds.join(","));

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
};

// Hook for fetching and managing related products.
export const useRelatedProducts = (productId, product) => {
  const {
    currentData,
    isLoading: isQueryLoading,
    isFetching,
    error,
  } = useGetRelatedProductsQuery(productId, {
    skip: !productId,
  });

  const products = useProcessedProducts(currentData);
  const isLoading = isQueryLoading || isFetching;
  const viewAllLink = useMemo(() => buildViewAllLink(product), [product]);
  const carousel = useProductCarousel(products, {
    autoScroll: true,
    autoScrollInterval: 3000,
  });

  return {
    products,
    isLoading,
    isError: Boolean(error),
    hasProducts: products.length > 0,
    viewAllLink,
    ...carousel,
  };
};
