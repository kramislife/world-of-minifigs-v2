import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import ProductCard from "@/components/products/ProductCard";
import { useLatestProducts } from "@/hooks/useProducts";

const LatestProduct = () => {
  const {
    products,
    isLoading,
    isError,
    hasProducts,
    setApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  } = useLatestProducts({ limit: 12 });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No products available"
        description="We're unable to load the latest products right now. Please try refreshing the page or check back later."
        minHeight="min-h-[200px]"
      />
    );
  }

  if (!hasProducts) {
    return (
      <ErrorState
        title="No products available"
        description="There are no products to display at this time. Please check back soon!"
        minHeight="min-h-[200px]"
      />
    );
  }

  return (
    <section className="p-5">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="tracking-widest uppercase text-xs sm:text-sm mb-1">
            Stay ahead of the build
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
            New Arrivals
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="shadow-none uppercase" asChild>
            <Link to="/products">View All</Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="hidden sm:flex border-none shadow-none rounded-full"
          >
            <ChevronLeft className="size-5" />
            <span className="sr-only">Previous</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="hidden sm:flex border-none shadow-none rounded-full"
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
          {products.map((product) => (
            <CarouselItem
              key={product._id}
              className="pl-2 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default LatestProduct;
