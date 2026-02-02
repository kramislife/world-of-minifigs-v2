import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/redux/apiConfig";

// Base query for public API (no auth required)
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1/public`,
  credentials: "include",
});

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery,
  tagTypes: [
    "Product",
    "Category",
    "Collection",
    "Color",
    "SkillLevel",
    "Banner",
  ],
  endpoints: (builder) => ({
    // Get products with filters, pagination, and sorting
    getProducts: builder.query({
      query: (params = {}) => {
        const queryParams = {};

        if (params.page) queryParams.page = params.page;
        if (params.limit) queryParams.limit = params.limit;
        if (params.search) queryParams.search = params.search;
        if (params.priceMin !== undefined && params.priceMin !== null)
          queryParams.priceMin = params.priceMin;
        if (params.priceMax !== undefined && params.priceMax !== null)
          queryParams.priceMax = params.priceMax;
        if (params.categoryIds?.length > 0)
          queryParams.categoryIds = params.categoryIds.join(",");
        if (params.subCategoryIds?.length > 0)
          queryParams.subCategoryIds = params.subCategoryIds.join(",");
        if (params.collectionIds?.length > 0)
          queryParams.collectionIds = params.collectionIds.join(",");
        if (params.subCollectionIds?.length > 0)
          queryParams.subCollectionIds = params.subCollectionIds.join(",");
        if (params.colorIds?.length > 0)
          queryParams.colorIds = params.colorIds.join(",");
        if (params.skillLevelIds?.length > 0)
          queryParams.skillLevelIds = params.skillLevelIds.join(",");
        if (params.sortBy) queryParams.sortBy = params.sortBy;

        return {
          url: "/",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Product"],
    }),

    // Get single product by ID (full details for detail page)
    getProductById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Product", id }],
    }),

    // Get categories with nested subcategories
    getPublicCategories: builder.query({
      query: () => ({
        url: "/filters/categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    // Get collections with nested subcollections
    getPublicCollections: builder.query({
      query: () => ({
        url: "/filters/collections",
        method: "GET",
      }),
      providesTags: ["Collection"],
    }),

    // Get colors
    getPublicColors: builder.query({
      query: () => ({
        url: "/filters/colors",
        method: "GET",
      }),
      providesTags: ["Color"],
    }),

    // Get skill levels
    getPublicSkillLevels: builder.query({
      query: () => ({
        url: "/filters/skill-levels",
        method: "GET",
      }),
      providesTags: ["SkillLevel"],
    }),
    // Get banners
    getPublicBanners: builder.query({
      query: () => ({
        url: "/banners",
        method: "GET",
      }),
      providesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetPublicCategoriesQuery,
  useGetPublicCollectionsQuery,
  useGetPublicColorsQuery,
  useGetPublicSkillLevelsQuery,
  useGetPublicBannersQuery,
} = publicApi;
