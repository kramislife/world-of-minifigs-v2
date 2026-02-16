import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/redux/apiConfig";

// Base query for public API (no auth required)
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1/public`,
  credentials: "include",
});

// Helper to build product list query params
const buildProductParams = (params = {}) => {
  const out = {};
  if (params.page) out.page = params.page;
  if (params.limit) out.limit = params.limit;
  if (params.search && typeof params.search === "string" && params.search.trim())
    out.search = params.search.trim();
  if (params.priceMin != null) out.priceMin = params.priceMin;
  if (params.priceMax != null) out.priceMax = params.priceMax;
  if (params.categoryIds?.length > 0)
    out.categoryIds = params.categoryIds.join(",");
  if (params.subCategoryIds?.length > 0)
    out.subCategoryIds = params.subCategoryIds.join(",");
  if (params.collectionIds?.length > 0)
    out.collectionIds = params.collectionIds.join(",");
  if (params.subCollectionIds?.length > 0)
    out.subCollectionIds = params.subCollectionIds.join(",");
  if (params.colorIds?.length > 0) out.colorIds = params.colorIds.join(",");
  if (params.skillLevelIds?.length > 0)
    out.skillLevelIds = params.skillLevelIds.join(",");
  if (params.sortBy) out.sortBy = params.sortBy;
  return out;
};

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
    "RewardBundle",
    "RewardAddon",
  ],
  endpoints: (builder) => ({
    // ==================== Products ====================
    getProducts: builder.query({
      query: (params = {}) => ({
        url: "/",
        method: "GET",
        params: buildProductParams(params),
      }),
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Product", id }],
    }),

    // ==================== Filters ====================
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

    getPublicBanners: builder.query({
      query: () => ({
        url: "/banners",
        method: "GET",
      }),
      providesTags: ["Banner"],
    }),

    // ==================== Reward Program ====================
    getRewardBundles: builder.query({
      query: () => ({
        url: "/reward/bundles",
        method: "GET",
      }),
      providesTags: ["RewardBundle"],
    }),

    getRewardAddons: builder.query({
      query: () => ({
        url: "/reward/addons",
        method: "GET",
      }),
      providesTags: ["RewardAddon"],
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

  useGetRewardBundlesQuery,
  useGetRewardAddonsQuery,
} = publicApi;
