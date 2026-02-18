import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/media/Logo.png";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { useCollectionsGrid, getCollectionLink } from "@/hooks/useCollections";

const CollectionsCarousel = () => {
  const { collections, hasMore, isLoading, isError, hasCollections } =
    useCollectionsGrid();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No collections available"
        description="We're unable to load collections at the moment. Please check back later or refresh the page."
        minHeight="min-h-[200px]"
      />
    );
  }

  if (!hasCollections) {
    return (
      <ErrorState
        title="No collections available"
        description="There are no collections to display at this time. Please check back soon!"
        minHeight="min-h-[200px]"
      />
    );
  }

  return (
    <section className="p-5 bg-input/50 dark:bg-card/50">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="tracking-widest uppercase text-xs sm:text-sm mb-1">
            Explore worlds waiting to be built
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
            Themes
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasMore && (
            <Button variant="outline" className="shadow-none uppercase" asChild>
              <Link to="/collections">View All</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Grid - 4 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {collections.map((collection) => (
          <Link
            key={collection._id}
            to={getCollectionLink(collection)}
            className="block group"
          >
            <div className="relative aspect-square overflow-hidden flex items-center justify-center border">
              {/* Background Image */}
              {collection.image?.url ? (
                <img
                  src={collection.image.url}
                  alt={collection.collectionName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <img
                  src={Logo}
                  alt="Placeholder"
                  className="max-h-40 max-w-40 object-contain opacity-80"
                />
              )}

              {/* Collection Name */}
              <div className="absolute inset-x-0 bottom-2 px-2">
                <h3 className="text-background dark:text-foreground font-bold text-2xl uppercase text-center">
                  {collection.collectionName}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CollectionsCarousel;

// import React from "react";
// import { Link } from "react-router-dom";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
// } from "@/components/ui/carousel";
// import { Button } from "@/components/ui/button";
// import Logo from "@/assets/media/Logo.png";
// import LoadingSpinner from "@/components/shared/LoadingSpinner";
// import ErrorState from "@/components/shared/ErrorState";
// import {
//   useCollectionsCarousel,
//   getCollectionLink,
// } from "@/hooks/useCollections";

// const CollectionsCarousel = () => {
//   const {
//     collections,
//     isLoading,
//     isError,
//     hasCollections,
//     setApi,
//     canScrollPrev,
//     canScrollNext,
//     scrollPrev,
//     scrollNext,
//   } = useCollectionsCarousel();

//   if (isLoading) {
//     return <LoadingSpinner />;
//   }

//   if (isError) {
//     return (
//       <ErrorState
//         title="No collections available"
//         description="We're unable to load collections at the moment. Please check back later or refresh the page."
//         minHeight="min-h-[200px]"
//       />
//     );
//   }

//   if (!hasCollections) {
//     return (
//       <ErrorState
//         title="No collections available"
//         description="There are no collections to display at this time. Please check back soon!"
//         minHeight="min-h-[200px]"
//       />
//     );
//   }

//   return (
//     <section className="p-5">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
//           Themes
//         </h2>

//         <div className="flex items-center gap-2">
//           <Button variant="outline" className="shadow-none uppercase" asChild>
//             <Link to="/collections">View All</Link>
//           </Button>

//           <Button
//             variant="outline"
//             size="icon"
//             onClick={scrollPrev}
//             disabled={!canScrollPrev}
//             className="hidden sm:flex border-none shadow-none rounded-full"
//           >
//             <ChevronLeft className="size-5" />
//             <span className="sr-only">Previous</span>
//           </Button>

//           <Button
//             variant="outline"
//             size="icon"
//             onClick={scrollNext}
//             disabled={!canScrollNext}
//             className="hidden sm:flex border-none shadow-none rounded-full"
//           >
//             <ChevronRight className="size-5" />
//             <span className="sr-only">Next</span>
//           </Button>
//         </div>
//       </div>

//       {/* Carousel */}
//       <Carousel
//         setApi={setApi}
//         opts={{
//           align: "start",
//           loop: false,
//         }}
//         className="w-full"
//       >
//         <CarouselContent className="-ml-2">
//           {collections.map((collection) => (
//             <CarouselItem
//               key={collection._id}
//               className="pl-2 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
//             >
//               <Link to={getCollectionLink(collection)} className="block group">
//                 <div className="relative aspect-square overflow-hidden flex items-center justify-center border">
//                   {/* Background Image */}
//                   {collection.image?.url ? (
//                     <img
//                       src={collection.image.url}
//                       alt={collection.collectionName}
//                       className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                     />
//                   ) : (
//                     <img
//                       src={Logo}
//                       alt="Placeholder"
//                       className="max-h-40 max-w-40 object-contain opacity-80"
//                     />
//                   )}

//                   {/* Collection Name */}
//                   <div className="absolute inset-x-0 bottom-2 px-2">
//                     <h3 className="text-background dark:text-foreground font-bold text-2xl  uppercase text-center">
//                       {collection.collectionName}
//                     </h3>
//                   </div>
//                 </div>
//               </Link>
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//       </Carousel>
//     </section>
//   );
// };

// export default CollectionsCarousel;
