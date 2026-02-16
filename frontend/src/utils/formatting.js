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
