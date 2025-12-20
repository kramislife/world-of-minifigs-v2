import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/admin",
    credentials: "include",
  }),
  tagTypes: ["Color"],
  endpoints: (builder) => ({
    // ==================== Color Management ====================
    // Get all colors
    getColors: builder.query({
      query: () => ({
        url: "/colors",
        method: "GET",
      }),
      providesTags: ["Color"],
    }),

    // Get single color by ID
    getColorById: builder.query({
      query: (id) => ({
        url: `/colors/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Color", id }],
    }),

    // Create color (admin only)
    createColor: builder.mutation({
      query: (colorData) => ({
        url: "/colors",
        method: "POST",
        body: colorData,
      }),
      invalidatesTags: ["Color"],
    }),

    // Update color (admin only)
    updateColor: builder.mutation({
      query: ({ id, ...colorData }) => ({
        url: `/colors/${id}`,
        method: "PUT",
        body: colorData,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Color", id }, "Color"],
    }),

    // Delete color (admin only)
    deleteColor: builder.mutation({
      query: (id) => ({
        url: `/colors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Color"],
    }),
  }),
});

export const {
  useGetColorsQuery,
  useGetColorByIdQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = adminApi;
