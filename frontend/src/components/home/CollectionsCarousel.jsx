import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useCollectionsCarousel } from "@/hooks/useCollections";

const CollectionsCarousel = () => {
  const {
    collections,
    isLoading,
    isError,
    hasCollections,
    setApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  } = useCollectionsCarousel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-lg">Loading collections...</p>
      </div>
    );
  }

  if (isError || !hasCollections) {
    return null;
  }

  return (
    <section className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-5xl font-black tracking-tight uppercase">Themes</h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden sm:flex shadow-none uppercase"
            asChild
          >
            <Link to="/collections">View All</Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="border-none shadow-none rounded-full"
          >
            <ChevronLeft className="size-5" />
            <span className="sr-only">Previous</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="border-none shadow-none rounded-full"
          >
            <ChevronRight className="size-5" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {collections.map((collection) => (
            <CarouselItem
              key={collection._id}
              className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4"
            >
              <Link
                to={`/products?collectionIds=${collection._id}`}
                className="block group"
              >
                <div className="relative aspect-auto overflow-hidden rounded-md">
                  {/* Background Image */}
                  <img
                    src={collection.image?.url}
                    alt={collection.collectionName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                  {/* Collection Name */}
                  <div className="absolute inset-x-0 top-4 px-3">
                    <h3 className="text-background dark:text-foreground font-black text-2xl  uppercase drop-shadow-2xl">
                      {collection.collectionName}
                    </h3>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default CollectionsCarousel;
