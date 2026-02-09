import Bundle from "../models/bundle.model.js";
import Addon from "../models/addon.model.js";
import {
  normalizePagination,
  buildSearchQuery,
  paginateQuery,
  createPaginationResponse,
} from "../utils/pagination.js";

// ==================== Helper Functions ====================

const handleError = (res, error, logPrefix, customMessage) => {
  console.error(`${logPrefix}:`, error);
  res.status(500).json({
    success: false,
    message: customMessage || "Internal server error",
    description: "An unexpected error occurred. Please try again.",
  });
};

const validateFeatures = (features) => {
  if (features && Array.isArray(features) && features.length > 5) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: "Too many features",
        description: "A bundle/add-on can have a maximum of 5 features.",
      },
    };
  }
  return { isValid: true };
};

const processFeatures = (features) => {
  // Only include features if it's a non-empty array
  if (features && Array.isArray(features) && features.length > 0) {
    return features;
  }
  return undefined;
};

// Unset items field for reward addons
const unsetRewardAddonItems = async (addonId) => {
  await Addon.findByIdAndUpdate(addonId, { $unset: { items: "" } });
};

const findRewardBundleById = async (id) => {
  return await Bundle.findOne({ _id: id, bundleType: "reward" });
};

const findRewardAddonById = async (id) => {
  return await Addon.findOne({ _id: id, addonType: "reward" });
};

const checkBundleQuantityConflict = async (
  minifigQuantity,
  excludeId = null,
) => {
  const query = {
    bundleType: "reward",
    minifigQuantity,
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Bundle.findOne(query);
};

const checkAddonNameConflict = async (
  addonName,
  addonType,
  excludeId = null,
) => {
  const query = {
    addonName: addonName.trim(),
    addonType,
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Addon.findOne(query);
};

const getStandardPopulateOptions = () => [
  { path: "createdBy", select: "firstName lastName username" },
  { path: "updatedBy", select: "firstName lastName username" },
];

// ==================== Create Reward Bundle ====================

export const createRewardBundle = async (req, res) => {
  try {
    const { bundleName, minifigQuantity, totalPrice, features, isActive } =
      req.body;

    // Validate features
    const featuresValidation = validateFeatures(features);
    if (!featuresValidation.isValid) {
      return res
        .status(featuresValidation.error.status)
        .json(featuresValidation.error);
    }

    // Validate required fields
    if (!bundleName) {
      return res.status(400).json({
        success: false,
        message: "Bundle name is required",
        description: "Please provide a name for the bundle.",
      });
    }

    if (!minifigQuantity || minifigQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
        description: "Quantity must be at least 1 minifig.",
      });
    }

    // Check for existing bundle with same quantity
    const existingBundle = await checkBundleQuantityConflict(minifigQuantity);
    if (existingBundle) {
      return res.status(409).json({
        success: false,
        message: "Bundle already exists",
        description: `A reward bundle with ${minifigQuantity} minifigs already exists.`,
      });
    }

    // Prepare bundle data
    const bundleData = {
      bundleName: bundleName.trim(),
      bundleType: "reward",
      minifigQuantity,
      totalPrice,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    };

    const processedFeatures = processFeatures(features);
    if (processedFeatures) {
      bundleData.features = processedFeatures;
    }

    const bundle = await Bundle.create(bundleData);

    return res.status(201).json({
      success: true,
      message: "Reward bundle created successfully",
      description: `The "${bundle.bundleName}" reward bundle has been added.`,
      bundle,
    });
  } catch (error) {
    handleError(res, error, "Create reward bundle", "Failed to create bundle");
  }
};

// ==================== Get All Reward Bundles ====================

export const getAllRewardBundles = async (req, res) => {
  try {
    const { page, limit, search } = normalizePagination(req.query);

    const searchQuery = {
      bundleType: "reward",
      ...buildSearchQuery(search, ["bundleName"]),
    };

    const result = await paginateQuery(Bundle, searchQuery, {
      page,
      limit,
      populate: getStandardPopulateOptions(),
    });

    return res.status(200).json(createPaginationResponse(result, "bundles"));
  } catch (error) {
    handleError(res, error, "Get reward bundles", "Failed to fetch bundles");
  }
};

// ==================== Update Reward Bundle ====================

export const updateRewardBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const { bundleName, minifigQuantity, totalPrice, features, isActive } =
      req.body;

    // Validate features
    const featuresValidation = validateFeatures(features);
    if (!featuresValidation.isValid) {
      return res
        .status(featuresValidation.error.status)
        .json(featuresValidation.error);
    }

    // Find bundle
    const bundle = await findRewardBundleById(id);
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
        description: "The requested reward bundle does not exist.",
      });
    }

    // Update fields
    if (bundleName) bundle.bundleName = bundleName.trim();

    if (minifigQuantity !== undefined) {
      if (minifigQuantity !== bundle.minifigQuantity) {
        const conflict = await checkBundleQuantityConflict(minifigQuantity, id);
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: "Quantity conflict",
            description: `Another reward bundle with ${minifigQuantity} minifigs already exists.`,
          });
        }
      }
      bundle.minifigQuantity = minifigQuantity;
    }

    if (totalPrice !== undefined) bundle.totalPrice = totalPrice;

    if (features !== undefined) {
      const processedFeatures = processFeatures(features);
      bundle.features = processedFeatures;
    }

    if (isActive !== undefined) bundle.isActive = isActive;

    bundle.updatedBy = req.user._id;
    await bundle.save();

    return res.status(200).json({
      success: true,
      message: "Reward bundle updated successfully",
      description: `The "${bundle.bundleName}" bundle has been successfully updated.`,
      bundle,
    });
  } catch (error) {
    handleError(res, error, "Update reward bundle", "Failed to update bundle");
  }
};

// ==================== Delete Reward Bundle ====================

export const deleteRewardBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await Bundle.findOneAndDelete({
      _id: id,
      bundleType: "reward",
    });

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
        description: "The requested reward bundle does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reward bundle deleted successfully",
      description: `The bundle has been removed from reward options.`,
    });
  } catch (error) {
    handleError(res, error, "Delete reward bundle", "Failed to delete bundle");
  }
};

// ==================== Create Reward Addon ====================

export const createRewardAddon = async (req, res) => {
  try {
    const { addonName, price, features, isActive } = req.body;

    // Validate features
    const featuresValidation = validateFeatures(features);
    if (!featuresValidation.isValid) {
      return res
        .status(featuresValidation.error.status)
        .json(featuresValidation.error);
    }

    // Validate required fields
    if (!addonName) {
      return res.status(400).json({
        success: false,
        message: "Add-on name is required",
        description: "Please provide a name for the add-on.",
      });
    }

    // Check for existing addon with same name
    const existingAddon = await checkAddonNameConflict(addonName, "reward");
    if (existingAddon) {
      return res.status(409).json({
        success: false,
        message: "Add-on already exists",
        description: `An add-on with the name "${addonName}" already exists for rewards.`,
      });
    }

    // Prepare addon data
    const addonData = {
      addonName: addonName.trim(),
      addonType: "reward",
      price,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    };

    const processedFeatures = processFeatures(features);
    if (processedFeatures) {
      addonData.features = processedFeatures;
    }

    const addon = await Addon.create(addonData);

    // Unset items field
    await unsetRewardAddonItems(addon._id);

    return res.status(201).json({
      success: true,
      message: "Reward add-on created successfully",
      description: `The "${addon.addonName}" add-on is now available for rewards.`,
      addon,
    });
  } catch (error) {
    handleError(res, error, "Create reward addon", "Failed to create add-on");
  }
};

// ==================== Get All Reward Addons ====================

export const getAllRewardAddons = async (req, res) => {
  try {
    const { page, limit, search } = normalizePagination(req.query);

    const searchQuery = {
      addonType: "reward",
      ...buildSearchQuery(search, ["addonName"]),
    };

    const result = await paginateQuery(Addon, searchQuery, {
      page,
      limit,
      populate: getStandardPopulateOptions(),
    });

    return res.status(200).json(createPaginationResponse(result, "addons"));
  } catch (error) {
    handleError(res, error, "Get reward addons", "Failed to fetch add-ons");
  }
};

// ==================== Update Reward Addon ====================

export const updateRewardAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const { addonName, price, features, isActive } = req.body;

    // Validate features
    const featuresValidation = validateFeatures(features);
    if (!featuresValidation.isValid) {
      return res
        .status(featuresValidation.error.status)
        .json(featuresValidation.error);
    }

    // Find addon
    const addon = await findRewardAddonById(id);
    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Add-on not found",
        description: "The requested reward add-on does not exist.",
      });
    }

    // Update fields
    if (addonName) {
      const addonNameTrimmed = addonName.trim();
      if (addonNameTrimmed !== addon.addonName) {
        const conflict = await checkAddonNameConflict(
          addonNameTrimmed,
          "reward",
          id,
        );
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: "Name already taken",
            description: `Another reward add-on named "${addonNameTrimmed}" already exists.`,
          });
        }
      }
      addon.addonName = addonNameTrimmed;
    }

    if (price !== undefined) addon.price = price;

    if (features !== undefined) {
      const processedFeatures = processFeatures(features);
      addon.features = processedFeatures;
    }

    if (isActive !== undefined) addon.isActive = isActive;

    addon.updatedBy = req.user._id;
    await addon.save();

    // Unset items field if it exists
    await unsetRewardAddonItems(addon._id);

    return res.status(200).json({
      success: true,
      message: "Reward add-on updated successfully",
      description: `The "${addon.addonName}" add-on has been updated.`,
      addon,
    });
  } catch (error) {
    handleError(res, error, "Update reward addon", "Failed to update add-on");
  }
};

// ==================== Delete Reward Addon ====================

export const deleteRewardAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const addon = await findRewardAddonById(id);

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Add-on not found",
        description: "The requested reward add-on does not exist.",
      });
    }

    await Addon.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Reward add-on deleted successfully",
      description: "The add-on has been removed from reward options.",
    });
  } catch (error) {
    handleError(res, error, "Delete reward addon", "Failed to delete add-on");
  }
};
