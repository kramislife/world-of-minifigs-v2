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

export const formatFullName = (user) => {
  if (!user?.firstName && !user?.lastName) return "-";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";

  const num = Number(value);
  if (isNaN(num)) return "-";

  return `$${num.toFixed(2)}`;
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

export const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-US", {
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

export const sortByName = (items = [], key) =>
  [...items].sort((a, b) => (a[key] || "").localeCompare(b[key] || ""));
