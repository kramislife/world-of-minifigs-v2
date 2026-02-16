import { toast } from "sonner";

export const handleApiError = (
  error,
  fallbackMessage = "An error occurred",
  fallbackDescription = "An unexpected error occurred. Please try again.",
) => {
  toast.error(error?.data?.message || fallbackMessage, {
    description: error?.data?.description || fallbackDescription,
  });
};

export const handleApiSuccess = (
  response,
  fallbackMessage = "Operation successful",
  fallbackDescription,
) => {
  toast.success(response.message || fallbackMessage, {
    description: response.description || fallbackDescription,
  });
};

export const ensureArray = (value) =>
  Array.isArray(value) ? value : [];

export const extractPaginatedData = (data, key) => ({
  items: ensureArray(data?.[key]),
  totalItems: data?.pagination?.totalItems || 0,
  totalPages: data?.pagination?.totalPages || 1,
});
