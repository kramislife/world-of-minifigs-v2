import React from "react";
import { useSelector } from "react-redux";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import NotFound from "@/components/layout/NotFound";

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles,
  UnauthorizedComponent = NotFound,
}) => {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth,
  );

  // Wait for auth initialization to complete before checking
  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  const renderUnauthorized = () => <UnauthorizedComponent />;

  // Check if authentication is required
  if (!isAuthenticated || !user) {
    return renderUnauthorized();
  }

  // Check if specific role(s) is required
  const rolesToCheck = requiredRoles || (requiredRole ? [requiredRole] : []);

  // If roles are specified, user must have one of them
  if (rolesToCheck.length > 0) {
    // Ensure user.role exists and is a string
    const userRole = user?.role;

    // Strict check: role must exist, be a string, and match one of the required roles
    if (!userRole || typeof userRole !== "string") {
      return renderUnauthorized();
    }

    // Check if user role is in the allowed roles list (case-sensitive)
    const normalizedUserRole = userRole.toLowerCase().trim();
    const normalizedRequiredRoles = rolesToCheck.map((role) =>
      typeof role === "string" ? role.toLowerCase().trim() : "",
    );

    if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
      return renderUnauthorized();
    }
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;
