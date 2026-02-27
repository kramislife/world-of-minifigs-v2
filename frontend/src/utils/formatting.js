export const sanitizeString = (value) => (value ?? "").toString().trim();

export const sanitizeOptional = (value) => {
  const trimmed = sanitizeString(value);
  return trimmed || undefined;
};

export const getInitials = (user) => {
  if (!user?.firstName || !user?.lastName) {
    return user?.username?.charAt(0)?.toUpperCase() || "U";
  }
  return (
    user.firstName.charAt(0).toUpperCase() +
    user.lastName.charAt(0).toUpperCase()
  );
};

export const getProductDisplayInfo = (product) => ({
  displayPrice: product?.discountPrice ?? product?.price,
  hasDiscount: Boolean(product?.discountPrice),
});

export const parseArrayParam = (param) =>
  param?.split(",").filter(Boolean) || [];

export const toggleArrayItem = (array, item) =>
  array.includes(item) ? array.filter((id) => id !== item) : [...array, item];

export const toggleSetItem = (set, item) => {
  const newSet = new Set(set);
  newSet.has(item) ? newSet.delete(item) : newSet.add(item);
  return newSet;
};

export const formatCurrency = (value) => Number(value ?? 0).toFixed(2);

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

export const cleanFeatures = (features) =>
  (features || []).map((f) => String(f ?? "").trim()).filter((f) => f !== "");

export const display = (value) =>
  value === null || value === undefined || value === "" ? "-" : value;
