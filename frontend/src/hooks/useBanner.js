import { useMemo } from "react";
import { useCarousel } from "@/hooks/useCarousel";
import { useGetPublicBannersQuery } from "@/redux/api/publicApi";

const AUTO_SCROLL_INTERVAL = 5000;

export const positionMap = {
  center: "items-center justify-center text-center",
  "bottom-left": "items-end justify-start text-left",
  "bottom-right": "items-end justify-end text-right",
};

export const useBanner = () => {
  const { data, isLoading, isError } = useGetPublicBannersQuery();

  // Prepare banners for rendering (active + defaults)
  const banners = useMemo(() => {
    if (!data?.banners) return [];

    return [...data.banners]
      .filter((b) => b.isActive)
      .sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0) ||
          new Date(a.createdAt) - new Date(b.createdAt),
      )
      .map((b) => ({
        ...b,
        position: b.position || "center",
        textTheme: b.textTheme || "light",
        alignmentClasses: positionMap[b.position] || positionMap.center,
      }));
  }, [data?.banners]);

  const {
    api,
    setApi,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  } = useCarousel({
    autoScroll: true,
    autoScrollInterval: AUTO_SCROLL_INTERVAL,
    itemCount: banners.length,
  });

  return {
    banners,
    isLoading,
    isError,
    hasBanners: banners.length > 0,

    api,
    setApi,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  };
};
