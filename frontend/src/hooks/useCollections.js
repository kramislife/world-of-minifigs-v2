import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetPublicCollectionsQuery } from "@/redux/api/publicApi";

const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

export const useCollections = () => {
  const { data, isLoading, isError } = useGetPublicCollectionsQuery();

  // Get collections that are NOT marked as featured
  const collections = useMemo(() => {
    if (!data?.collections) return [];
    return data.collections.filter((c) => !c.isFeatured);
  }, [data?.collections]);

  const hasCollections = collections.length > 0;

  return {
    collections,
    isLoading,
    isError,
    hasCollections,
  };
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
