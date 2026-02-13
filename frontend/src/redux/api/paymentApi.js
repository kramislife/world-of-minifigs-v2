import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "@/redux/slices/authSlice";
import { API_BASE_URL } from "@/redux/apiConfig";

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1/payment`,
  credentials: "include",
});

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
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: () => ({
        url: "/create-checkout-session",
        method: "POST",
      }),
    }),
    confirmOrder: builder.query({
      query: (sessionId) =>
        `/confirm-order?session_id=${encodeURIComponent(sessionId)}`,
    }),
  }),
});

export const { useCreateCheckoutSessionMutation, useConfirmOrderQuery } =
  paymentApi;
