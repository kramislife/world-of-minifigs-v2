import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "@/redux/slices/authSlice";
import { API_BASE_URL } from "@/redux/apiConfig";

// Base query with auth credentials
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1/payment`,
  credentials: "include",
});

// Wrapper that handles 401 responses globally
const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(clearCredentials());
  }
  return result;
};

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // ==================== Checkout & Orders ====================
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: "/create-checkout-session",
        method: "POST",
        body: data,
      }),
    }),
    confirmOrder: builder.query({
      query: (sessionId) => ({
        url: "/confirm-order",
        method: "GET",
        params: { session_id: sessionId },
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useConfirmOrderQuery,
} = paymentApi;

