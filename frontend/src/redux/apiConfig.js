const getApiBaseUrl = () => {
  // In production, use the full backend URL from environment variable
  if (import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In development, use relative paths (proxy handles it)
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoint paths
export const API_ENDPOINTS = {
  PUBLIC: "/api/v1/public",
  AUTH: "/api/v1/auth",
  USER: "/api/v1/user",
  ADMIN: "/api/v1/admin",
};

// Full API URLs - Use these in your API files
export const API_URLS = {
  PUBLIC: `${API_BASE_URL}${API_ENDPOINTS.PUBLIC}`,
  AUTH: `${API_BASE_URL}${API_ENDPOINTS.AUTH}`,
  USER: `${API_BASE_URL}${API_ENDPOINTS.USER}`,
  ADMIN: `${API_BASE_URL}${API_ENDPOINTS.ADMIN}`,
};

