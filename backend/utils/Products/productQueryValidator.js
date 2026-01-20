import mongoose from "mongoose";

// Validate and normalize price parameters
export const validatePriceParams = (priceMin, priceMax) => {
  let normalizedMin = null;
  let normalizedMax = null;

  if (priceMin !== undefined && priceMin !== null && priceMin !== "") {
    const parsed = parseFloat(priceMin);
    if (!isNaN(parsed) && parsed >= 0) {
      normalizedMin = parsed;
    }
  }

  if (priceMax !== undefined && priceMax !== null && priceMax !== "") {
    const parsed = parseFloat(priceMax);
    if (!isNaN(parsed) && parsed >= 0) {
      normalizedMax = parsed;
    }
  }

  // Validate that min <= max if both are provided
  if (
    normalizedMin !== null &&
    normalizedMax !== null &&
    normalizedMin > normalizedMax
  ) {
    return {
      isValid: false,
      error: "priceMin cannot be greater than priceMax",
    };
  }

  return {
    isValid: true,
    priceMin: normalizedMin,
    priceMax: normalizedMax,
  };
};

// Validate sortBy parameter
export const validateSortBy = (sortBy) => {
  const validSortOptions = [
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
    "date_asc",
    "date_desc",
  ];

  if (!sortBy || typeof sortBy !== "string") {
    return "date_desc"; // Default
  }

  return validSortOptions.includes(sortBy) ? sortBy : "date_desc";
};

// Validate MongoDB ObjectId format
export const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate and filter array of IDs
export const validateAndFilterIds = (ids) => {
  if (!ids || !Array.isArray(ids)) return [];
  return ids.filter((id) => isValidObjectId(id));
};

// Validate pagination limit for public products
export const validatePublicProductLimit = (limit) => {
  const DEFAULT_LIMIT = 12;
  const MAX_LIMIT = 100;
  const MIN_LIMIT = 1;

  if (!limit) return DEFAULT_LIMIT;

  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed < MIN_LIMIT) return DEFAULT_LIMIT;
  if (parsed > MAX_LIMIT) return MAX_LIMIT;

  return parsed;
};
