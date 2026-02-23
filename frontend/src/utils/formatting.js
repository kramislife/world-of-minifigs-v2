// Get user initials for avatar display
export const getInitials = (user) => {
  if (!user?.firstName || !user?.lastName) {
    return user?.username?.charAt(0)?.toUpperCase() || "U";
  }
  const firstInitial = user.firstName.charAt(0).toUpperCase();
  const lastInitial = user.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

// Calculate display price and discount status for a product
export const getProductDisplayInfo = (product) => ({
  displayPrice: product?.discountPrice ?? product?.price,
  hasDiscount: Boolean(product?.discountPrice),
});

// Parse comma-separated URL param to array
export const parseArrayParam = (param) =>
  param?.split(",").filter(Boolean) || [];

// Toggle item in array (add if not present, remove if present)
export const toggleArrayItem = (array, item) =>
  array.includes(item) ? array.filter((id) => id !== item) : [...array, item];

// Toggle item in Set (add if not present, remove if present)
export const toggleSetItem = (set, item) => {
  const newSet = new Set(set);
  if (newSet.has(item)) {
    newSet.delete(item);
  } else {
    newSet.add(item);
  }
  return newSet;
};

// Format a numeric value as a two-decimal currency string (e.g. "12.99")
export const formatCurrency = (value) => Number(value ?? 0).toFixed(2);

// Format a date string to a readable format with time
export const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
