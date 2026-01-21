// API Configuration
// Uses environment variable for production, falls back to relative path for development

const getApiBaseUrl = () => {
  // In production, use environment variable
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use relative path (Vite proxy handles it)
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

