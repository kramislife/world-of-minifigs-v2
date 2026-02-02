import { useMemo, useState, useEffect } from "react";
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
  const [currentInterval, setCurrentInterval] = useState(AUTO_SCROLL_INTERVAL);

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

  const { api, setApi, selectedIndex, scrollTo } = useCarousel({
    autoScroll: true,
    autoScrollInterval: currentInterval,
    itemCount: banners.length,
  });

  // Sync auto-scroll interval with content duration
  useEffect(() => {
    if (banners.length === 0) return;

    const banner = banners[selectedIndex];
    if (!banner) return;

    const isVideo = banner.media?.resourceType === "video";
    const isGif = banner.media?.url?.toLowerCase().endsWith(".gif");

    if ((isVideo || isGif) && banner.media?.duration) {
      // Use video duration with a tiny safety buffer (200ms) to ensure transition happens BEFORE any loop/end glitch
      const durationMs = banner.media.duration * 1000;
      setCurrentInterval(Math.max(durationMs - 200, 2000));
    } else {
      // Default for images
      setCurrentInterval(AUTO_SCROLL_INTERVAL);
    }
  }, [selectedIndex, banners]);

  // Video playback synchronization logic
  useEffect(() => {
    const videos = document.querySelectorAll("video[data-banner-video]");
    videos.forEach((video) => {
      const videoIndex = parseInt(video.dataset.bannerVideo);
      if (videoIndex === selectedIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [selectedIndex, banners]);

  // Animation Variants Logic
  const animationVariants = useMemo(
    () => ({
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 1.0,
          },
        },
      },
      item: {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: [0.33, 1, 0.68, 1], // Custom slow-out ease
          },
        },
      },
    }),
    [],
  );

  return {
    banners,
    isLoading,
    isError,
    hasBanners: banners.length > 0,

    setApi,
    selectedIndex,
    scrollTo,
    ...animationVariants,
  };
};
