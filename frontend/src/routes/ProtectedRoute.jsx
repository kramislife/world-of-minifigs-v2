import React from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requiredRole, requiredRoles }) => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth,
  );

  // Wait for auth initialization to complete before checking
  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  // Check if authentication is required
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check if specific role(s) is required
  const rolesToCheck = requiredRoles || (requiredRole ? [requiredRole] : []);

  // If roles are specified, user must have one of them
  if (rolesToCheck.length > 0) {
    // Ensure user.role exists and is a string
    const userRole = user?.role;

    // Strict check: role must exist, be a string, and match one of the required roles
    if (!userRole || typeof userRole !== "string") {
      // Invalid or missing role - redirect to home
      return <Navigate to="/" replace />;
    }

    // Check if user role is in the allowed roles list (case-sensitive)
    const normalizedUserRole = userRole.toLowerCase().trim();
    const normalizedRequiredRoles = rolesToCheck.map((role) =>
      typeof role === "string" ? role.toLowerCase().trim() : "",
    );

    if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
      // User role doesn't match required roles - redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;
