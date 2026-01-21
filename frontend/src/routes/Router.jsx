import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import {
  publicRoutes,
  privateRoutes,
  adminRoutes,
  notFoundRoute,
} from "@/routes/routeConfig";

const Router = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<route.element />} />
      ))}

      {/* Private Routes (non-admin) */}
      {privateRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute
              requiredRole={route.requiredRole}
              requiredRoles={route.requiredRoles}
            >
              <route.element />
            </ProtectedRoute>
          }
        />
      ))}

      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute requiredRole={route.requiredRole}>
              <route.element />
            </ProtectedRoute>
          }
        >
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          {/* Nested admin routes */}
          {route.children?.map((childRoute) => (
            <Route
              key={childRoute.path}
              path={childRoute.path}
              element={<childRoute.element />}
            />
          ))}
        </Route>
      ))}

      {/* 404 Route - must be last */}
      <Route path={notFoundRoute.path} element={<notFoundRoute.element />} />
    </Routes>
  );
};

export default Router;
