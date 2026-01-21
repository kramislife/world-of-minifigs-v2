import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "@/redux/slices/authSlice";
import { API_BASE_URL } from "@/redux/apiConfig";

// Base query with auth credentials
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1/auth`,
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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // ==================== Authentication ====================
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Small delay to ensure cookies are set before refetching
          setTimeout(() => {
            // Refetch current user after successful login to ensure auth state is synced
            dispatch(authApi.endpoints.getCurrentUser.initiate(undefined, { forceRefetch: true }));
          }, 100);
        } catch (error) {
          // Login failed, don't refetch
        }
      },
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // ==================== Verification ====================
    verifyEmail: builder.mutation({
      query: (token) => {
        const encodedToken = encodeURIComponent(token);
        return {
          url: "/verify-email",
          method: "POST",
          body: { token: encodedToken },
        };
      },
    }),

    resendVerification: builder.mutation({
      query: (data) => ({
        url: "/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    // ==================== User Management ====================
    getCurrentUser: builder.query({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // ==================== Forgot/Reset Password ====================
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
} = authApi;
