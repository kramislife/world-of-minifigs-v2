import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetPublicCollectionsQuery } from "@/redux/api/publicApi";

const DISPLAY_LIMIT = 8;

/** Helper function to determine collection link based on sub-collections */
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

/** Hook for non-featured collections */
export const useCollections = () => {
  const filterFn = useCallback((c) => !c.isFeatured, []);
  return useCollectionsBase(filterFn);
};

/** Hook for collections grid: limit to 8, show View All when more exist */
export const useCollectionsGrid = () => {
  const { collections, isLoading, isError, hasCollections } = useCollections();

  const displayedCollections = useMemo(
    () => collections.slice(0, DISPLAY_LIMIT),
    [collections],
  );
  const hasMore = collections.length > DISPLAY_LIMIT;

  return {
    collections: displayedCollections,
    hasMore,
    isLoading,
    isError,
    hasCollections,
  };
};

/** Hook for sub-collections page */
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
// import { useCallback, useMemo } from "react";
// import { useParams } from "react-router-dom";
// import { useCarousel } from "./useCarousel";
// import { useGetPublicCollectionsQuery } from "@/redux/api/publicApi";

// const AUTO_SCROLL_INTERVAL = 3000; // 3 seconds

// // Helper function to determine collection link based on sub-collections
// export const getCollectionLink = (collection) => {
//   const hasSubCollections = collection.subCollections?.length > 0;
//   return hasSubCollections
//     ? `/collections/${collection._id}`
//     : `/products?collectionIds=${collection._id}`;
// };

// // Base hook for fetching and filtering collections
// const useCollectionsBase = (filterFn) => {
//   const { data, isLoading, isError } = useGetPublicCollectionsQuery();

//   const collections = useMemo(() => {
//     if (!data?.collections) return [];
//     return filterFn ? data.collections.filter(filterFn) : data.collections;
//   }, [data?.collections, filterFn]);

//   const hasCollections = collections.length > 0;

//   return { collections, isLoading, isError, hasCollections };
// };

// // Hook for featured collections
// export const useFeaturedCollections = () => {
//   const filterFn = useCallback((c) => c.isFeatured, []);
//   return useCollectionsBase(filterFn);
// };

// // Hook for non-featured collections
// export const useCollections = () => {
//   const filterFn = useCallback((c) => !c.isFeatured, []);
//   return useCollectionsBase(filterFn);
// };

// export const useCollectionsCarousel = () => {
//   const { collections, isLoading, isError, hasCollections } = useCollections();

//   const { setApi, canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
//     useCarousel({
//       autoScroll: true,
//       autoScrollInterval: AUTO_SCROLL_INTERVAL,
//       itemCount: collections.length,
//     });

//   return {
//     // Data
//     collections,
//     isLoading,
//     isError,
//     hasCollections,

//     // Carousel state
//     setApi,
//     canScrollPrev,
//     canScrollNext,

//     // Carousel handlers
//     scrollPrev,
//     scrollNext,
//   };
// };

// // Hook for sub-collections page
// export const useSubCollections = () => {
//   const { collectionId } = useParams();
//   const { data, isLoading, isError } = useGetPublicCollectionsQuery();

//   const result = useMemo(() => {
//     if (!data?.collections || !collectionId) {
//       return { collection: null, subCollections: [] };
//     }

//     const collection = data.collections.find((c) => c._id === collectionId);
//     return {
//       collection,
//       subCollections: collection?.subCollections || [],
//     };
//   }, [data?.collections, collectionId]);

//   const hasSubCollections = result.subCollections.length > 0;

//   return {
//     collection: result.collection,
//     subCollections: result.subCollections,
//     isLoading,
//     isError,
//     hasSubCollections,
//   };
// };

