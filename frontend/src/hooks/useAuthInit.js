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
      // Only skip after we've verified once and user is authenticated
      skip: hasVerified.current && !!user,
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
      // Only clear credentials if user doesn't exist in state
      // This prevents clearing credentials immediately after login
      // when cookies haven't been processed yet
      if (!user) {
        dispatch(clearCredentials());
      }
      // If user exists but /me failed, it might be a cookie timing issue
      // Don't clear credentials immediately - let it retry on next page load
    } else if (data?.success && data?.user) {
      dispatch(setCredentials(data.user));
    }
  }, [data, isLoading, isFetching, error, isError, dispatch, user]);

  return { isLoading: isLoading || isFetching };
};

