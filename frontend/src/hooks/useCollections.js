import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetPublicCollectionsQuery } from "@/redux/api/publicApi";
import { useParams } from "react-router-dom";

const AUTO_SCROLL_INTERVAL = 3000; // 3 seconds

// Helper function to determine collection link based on sub-collections
export const getCollectionLink = (collection) => {
  const hasSubCollections = collection.subCollections?.length > 0;
  return hasSubCollections
    ? `/collections/${collection._id}`
    : `/products?collectionIds=${collection._id}`;
};

// Base hook for fetching and filtering collections
const useCollectionsBase = (filterFn) => {
  const { data, isLoading, isError } = useGetPublicCollectionsQuery();

  const collections = useMemo(() => {
    if (!data?.collections) return [];
    return filterFn ? data.collections.filter(filterFn) : data.collections;
  }, [data?.collections, filterFn]);

  const hasCollections = collections.length > 0;

  return { collections, isLoading, isError, hasCollections };
};

// Hook for featured collections
export const useFeaturedCollections = () => {
  const filterFn = useCallback((c) => c.isFeatured, []);
  return useCollectionsBase(filterFn);
};

// Hook for non-featured collections
export const useCollections = () => {
  const filterFn = useCallback((c) => !c.isFeatured, []);
  return useCollectionsBase(filterFn);
};

export const useCollectionsCarousel = () => {
  const { collections, isLoading, isError, hasCollections } = useCollections();

  const [api, setApi] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  // Setup carousel event listeners
  useEffect(() => {
    if (!api) return;

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  // Auto-scroll effect
  useEffect(() => {
    if (!api || collections.length <= 1) return;

    const autoScroll = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0); // Loop back to start
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(autoScroll);
  }, [api, collections.length]);

  return {
    // Data
    collections,
    isLoading,
    isError,
    hasCollections,

    // Carousel state
    setApi,
    canScrollPrev,
    canScrollNext,

    // Carousel handlers
    scrollPrev,
    scrollNext,
  };
};

// Hook for sub-collections page
export const useSubCollections = () => {
  const { collectionId } = useParams();
  const { data, isLoading, isError } = useGetPublicCollectionsQuery();

  const result = useMemo(() => {
    if (!data?.collections || !collectionId) {
      return { collection: null, subCollections: [] };
    }

    const collection = data.collections.find((c) => c._id === collectionId);
    return {
      collection,
      subCollections: collection?.subCollections || [],
    };
  }, [data?.collections, collectionId]);

  const hasSubCollections = result.subCollections.length > 0;

  return {
    collection: result.collection,
    subCollections: result.subCollections,
    isLoading,
    isError,
    hasSubCollections,
  };
};
