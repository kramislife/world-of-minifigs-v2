import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "@/redux/slices/authSlice";
import { API_URLS } from "../apiConfig";

// Base query with auth credentials
const baseQuery = fetchBaseQuery({
  baseUrl: API_URLS.USER,
  credentials: "include",
});

// Wrapper that handles 401 responses globally
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // If we get a 401, clear credentials (session expired)
  if (result?.error?.status === 401) {
    api.dispatch(clearCredentials());
  }

  return result;
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = userApi;