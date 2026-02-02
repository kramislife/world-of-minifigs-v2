import React from "react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useBanner } from "@/hooks/useBanner";

const Banner = () => {
  const {
    banners,
    isLoading,
    isError,
    hasBanners,
    setApi,
    selectedIndex,
    scrollTo,
  } = useBanner();

  if (isLoading || isError) return null;

  if (!hasBanners) return <div className="h-20" />;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 1.0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1], // Custom slow-out ease
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Pagination Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => scrollTo(index)}
              className={`h-2 p-0 rounded-full transition-all duration-300 hover:bg-white/60 ${
                selectedIndex === index ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {banners.map((banner, index) => {
            const textClass =
              banner.textTheme === "dark"
                ? "text-foreground dark:text-secondary-foreground"
                : "text-background dark:text-foreground";

            const mediaType = banner.media?.resourceType;
            const mediaUrl = banner.media?.url;

            return (
              <CarouselItem key={banner._id} className="h-full">
                <div className="relative w-full h-full aspect-4/5 md:aspect-16/7 overflow-hidden">
                  {/* Media */}
                  {mediaType === "video" ? (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      src={mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={banner.label || "Banner"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* Overlay (only when light text is used) */}
                  {banner.textTheme === "light" && (
                    <div className="absolute inset-0 bg-black/30" />
                  )}

                  {/* Content */}
                  <div
                    className={
                      "relative z-10 flex h-full w-full p-5 sm:p-10 " +
                      banner.alignmentClasses +
                      " " +
                      textClass
                    }
                  >
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate={selectedIndex === index ? "visible" : "hidden"}
                      className="max-w-3xl space-y-2"
                    >
                      {banner.badge && (
                        <motion.p
                          variants={itemVariants}
                          className="uppercase tracking-widest text-xs sm:text-sm pb-5"
                        >
                          {banner.badge}
                        </motion.p>
                      )}

                      {banner.label && (
                        <motion.h1
                          variants={itemVariants}
                          className="text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-tight"
                        >
                          {banner.label}
                        </motion.h1>
                      )}

                      {banner.description && (
                        <motion.p
                          variants={itemVariants}
                          className={
                            "text-sm" +
                            (banner.textTheme === "dark"
                              ? " text-foreground dark:text-secondary-foreground"
                              : " text-background dark:text-foreground")
                          }
                        >
                          {banner.description}
                        </motion.p>
                      )}

                      {banner.enableButtons &&
                        Array.isArray(banner.buttons) &&
                        banner.buttons.length > 0 && (
                          <motion.div
                            variants={itemVariants}
                            className={
                              "flex gap-3 pt-5 " +
                              (banner.position === "center"
                                ? "justify-center"
                                : banner.position === "bottom-right"
                                  ? "justify-end"
                                  : "")
                            }
                          >
                            {banner.buttons.map((btn, index) => {
                              const btnVariant =
                                btn.variant === "outline"
                                  ? "banner-outline"
                                  : "banner-default";

                              return (
                                <Button
                                  key={index}
                                  asChild
                                  variant={btnVariant}
                                  className="uppercase text-xs h-12 rounded-none "
                                >
                                  <Link to={btn.href || "#"}>{btn.label}</Link>
                                </Button>
                              );
                            })}
                          </motion.div>
                        )}
                    </motion.div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Banner;
