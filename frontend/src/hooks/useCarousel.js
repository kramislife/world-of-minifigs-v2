import { useCallback, useEffect, useState } from "react";

export const useCarousel = ({
  autoScroll = false,
  autoScrollInterval = 3000,
  itemCount = 0,
} = {}) => {
  const [api, setApi] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Scroll handlers
  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // Update scroll state
  const updateScrollState = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  // Setup carousel event listeners
  useEffect(() => {
    if (!api) return;

    updateScrollState();
    api.on("select", updateScrollState);
    api.on("reInit", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
      api.off("reInit", updateScrollState);
    };
  }, [api, updateScrollState]);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll || !api || itemCount <= 1) return;

    const autoScrollTimer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0); // Loop back to start
      }
    }, autoScrollInterval);

    return () => clearInterval(autoScrollTimer);
  }, [api, autoScroll, autoScrollInterval, itemCount]);

  return {
    api,
    setApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  };
};
