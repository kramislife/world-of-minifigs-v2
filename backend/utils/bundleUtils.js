import Bundle from "../models/bundle.model.js";

// --------------------------- Bundle Conflict Checks ---------------------------

export const checkBundleQuantityConflict = async (
  bundleType,
  minifigQuantity,
  excludeId = null,
) => {
  const query = { bundleType, minifigQuantity };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Bundle.findOne(query);
};

// Find a bundle by ID scoped to a bundle type
export const findBundleByIdAndType = async (bundleType, id) => {
  return Bundle.findOne({ _id: id, bundleType });
};

// --------------------------- Feature Validation ---------------------------

const MAX_FEATURES = 5;

export const validateFeatures = (features) => {
  if (features && Array.isArray(features) && features.length > MAX_FEATURES) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: "Too many features",
        description: `A bundle/add-on can have a maximum of ${MAX_FEATURES} features.`,
      },
    };
  }
  return { isValid: true };
};

export const processFeatures = (features) => {
  // Only include features if it's a non-empty array
  if (features && Array.isArray(features) && features.length > 0) {
    return features;
  }
  return undefined;
};

// Validate + process in one call
export const validateAndReturnFeatures = (features) => {
  const validation = validateFeatures(features);
  if (!validation.isValid) {
    return { error: validation.error };
  }
  return { features: processFeatures(features) };
};
