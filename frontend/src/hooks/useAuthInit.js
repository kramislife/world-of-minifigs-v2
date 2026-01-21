import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import {
  setCredentials,
  clearCredentials,
  setLoading,
} from "@/redux/slices/authSlice";

export const useAuthInit = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const hasVerified = useRef(false);

  // Always verify session on app load (don't skip)
  // This ensures expired sessions are detected even if user exists in localStorage
  const { data, isLoading, error, isError, isFetching } =
    useGetCurrentUserQuery(undefined, {
      // Skip only if we've verified once and user is authenticated
      // This prevents unnecessary refetches but allows verification on first load
      skip: hasVerified.current && !!user,
      // Refetch on mount to verify session after login
      refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setLoading(true));
      return;
    }

    dispatch(setLoading(false));

    // Mark as verified after first fetch completes
    hasVerified.current = true;

    if (isError || error || !data?.success || !data?.user) {
      // Session invalid or expired - clear credentials
      // The 401 handler in baseQuery will also trigger this
      dispatch(clearCredentials());
    } else if (data?.success && data?.user) {
      // Update credentials with fresh data from server
      dispatch(setCredentials(data.user));
    }
  }, [data, isLoading, isFetching, error, isError, dispatch]);

  return { isLoading: isLoading || isFetching };
};

