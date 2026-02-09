import Bundle from "../models/bundle.model.js";
import Addon from "../models/addon.model.js";
import DealerExtraBag from "../models/dealerExtraBag.model.js";
import DealerTorsoBag from "../models/dealerTorsoBag.model.js";
import SubCollection from "../models/subCollection.model.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
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
        description: "A bundle can have a maximum of 5 features.",
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

// Unset features field for dealer bundles/addons (arrays are initialized as [] by Mongoose even if not provided)
const unsetDealerFeatures = async (model, docId) => {
  await model.findByIdAndUpdate(docId, { $unset: { features: "" } });
};

const getMinRequiredQuantity = async () => {
  const lowestBundle = await Bundle.findOne({
    bundleType: "dealer",
    isActive: true,
  }).sort({ minifigQuantity: 1 });
  return lowestBundle ? lowestBundle.minifigQuantity : 100;
};

const validateTorsoItems = (items, minRequired) => {
  let totalQty = 0;
  for (const item of items) {
    const qty = Number(item.quantity || 0);
    if (qty > 4) {
      return {
        isValid: false,
        message: "Individual quantity limit exceeded",
        description: "Maximum quantity per design is 4.",
      };
    }
    totalQty += qty;
  }

  if (totalQty !== minRequired) {
    return {
      isValid: false,
      message: "Invalid total quantity",
      description: `Total designs quantity must equal the lowest bundle quantity (${minRequired}). Current total: ${totalQty}.`,
    };
  }

  return { isValid: true };
};

const cleanUpImages = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return;
  for (const item of items) {
    if (item.image?.publicId) {
      await deleteImage(item.image.publicId);
    }
  }
};

const findDealerBundleById = async (id) => {
  return await Bundle.findOne({ _id: id, bundleType: "dealer" });
};

const findDealerAddonById = async (id) => {
  return await Addon.findOne({ _id: id, addonType: "dealer" });
};

const checkBundleQuantityConflict = async (
  minifigQuantity,
  excludeId = null,
) => {
  const query = {
    bundleType: "dealer",
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

const checkExtraBagConflict = async (subCollectionId, excludeId = null) => {
  const query = { subCollectionId };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await DealerExtraBag.findOne(query);
};

const checkTorsoBagNameConflict = async (bagName, excludeId = null) => {
  const query = {
    bagName: { $regex: new RegExp(`^${bagName.trim()}$`, "i") },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await DealerTorsoBag.findOne(query);
};

const getStandardPopulateOptions = () => [
  { path: "createdBy", select: "firstName lastName username" },
  { path: "updatedBy", select: "firstName lastName username" },
];

const processAddonItems = async (
  items,
  folderPath = "world-of-minifigs-v2/dealers/addons",
) => {
  if (!items || !Array.isArray(items) || items.length === 0) return [];

  const processedItems = [];
  for (const itemData of items) {
    const isObject = typeof itemData === "object";
    const imageToUpload = isObject ? itemData.image : itemData;

    if (imageToUpload) {
      const uploadResult = await uploadImage(imageToUpload, folderPath);
      processedItems.push({
        itemName: isObject ? itemData.itemName : undefined,
        itemPrice: isObject ? itemData.itemPrice : undefined,
        color: isObject ? itemData.color : undefined,
        image: {
          publicId: uploadResult.public_id,
          url: uploadResult.url,
        },
      });
    }
  }
  return processedItems;
};

const processAddonItemsForUpdate = async (
  items,
  existingItems,
  folderPath = "world-of-minifigs-v2/dealers/addons",
) => {
  if (!items || !Array.isArray(items)) return null;

  const processedItems = [];
  const oldPublicIds = (existingItems || [])
    .map((item) => item.image?.publicId)
    .filter(Boolean);

  for (const itemData of items) {
    // If it has image object with publicId, it's an existing item
    if (
      typeof itemData === "object" &&
      itemData.image &&
      itemData.image.publicId
    ) {
      processedItems.push(itemData);
    } else {
      // New image/item
      const isObject = typeof itemData === "object";
      const imageToUpload = isObject ? itemData.image : itemData;

      if (imageToUpload) {
        const uploadResult = await uploadImage(imageToUpload, folderPath);
        processedItems.push({
          itemName: isObject ? itemData.itemName : undefined,
          itemPrice: isObject ? itemData.itemPrice : undefined,
          color: isObject ? itemData.color : undefined,
          image: {
            publicId: uploadResult.public_id,
            url: uploadResult.url,
          },
        });
      }
    }
  }

  // Find images to delete
  const newPublicIds = processedItems
    .map((item) => item.image?.publicId)
    .filter(Boolean);
  const idsToDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

  // Delete removed images
  for (const id of idsToDelete) {
    await deleteImage(id);
  }

  return processedItems;
};

const processTorsoBagItems = async (
  items,
  folderPath = "world-of-minifigs-v2/dealers/torsos",
) => {
  const uploadedItems = [];
  for (const item of items) {
    const designUpload = await uploadImage(item.image, folderPath);
    uploadedItems.push({
      image: {
        publicId: designUpload.public_id,
        url: designUpload.url,
      },
      quantity: Number(item.quantity),
    });
  }
  return uploadedItems;
};

const processTorsoBagItemsForUpdate = async (
  items,
  existingItems,
  folderPath = "world-of-minifigs-v2/dealers/torsos",
) => {
  const processedItems = [];
  const currentPublicIds = existingItems.map((item) => item.image.publicId);

  for (const itemData of items) {
    // If it has image object with publicId, it's an existing item
    if (
      typeof itemData === "object" &&
      itemData.image &&
      itemData.image.publicId
    ) {
      processedItems.push(itemData);
    } else {
      // New image/design
      const imageToUpload =
        typeof itemData.image === "string"
          ? itemData.image
          : itemData.image?.url;

      if (imageToUpload && !imageToUpload.startsWith("http")) {
        const uploadResult = await uploadImage(imageToUpload, folderPath);
        processedItems.push({
          image: {
            publicId: uploadResult.public_id,
            url: uploadResult.url,
          },
          quantity: Number(itemData.quantity),
        });
      }
    }
  }

  // Find images to delete
  const newPublicIds = processedItems.map((item) => item.image.publicId);
  const idsToDelete = currentPublicIds.filter(
    (id) => !newPublicIds.includes(id),
  );

  // Delete removed images
  for (const id of idsToDelete) {
    await deleteImage(id);
  }

  return processedItems;
};

// ==================== Create Dealer Bundle ====================

export const createDealerBundle = async (req, res) => {
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
        description: `A dealer bundle with ${minifigQuantity} minifigs already exists.`,
      });
    }

    const unitPrice = totalPrice / minifigQuantity;

    const bundleData = {
      bundleName: bundleName.trim(),
      bundleType: "dealer",
      minifigQuantity,
      unitPrice,
      totalPrice,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    };

    // Only include features if it's a non-empty array
    const processedFeatures = processFeatures(features);
    if (processedFeatures) {
      bundleData.features = processedFeatures;
    }

    const bundle = await Bundle.create(bundleData);

    // Unset features if empty
    if (!processedFeatures) {
      await unsetDealerFeatures(Bundle, bundle._id);
    }

    return res.status(201).json({
      success: true,
      message: "Bundle created successfully",
      description: `The "${bundle.bundleName}" bundle has been added to dealer options.`,
      bundle,
    });
  } catch (error) {
    handleError(res, error, "Create dealer bundle", "Failed to create bundle");
  }
};

// ==================== Get All Dealer Bundles ====================

export const getAllDealerBundles = async (req, res) => {
  try {
    const { page, limit, search } = normalizePagination(req.query);

    const searchQuery = {
      bundleType: "dealer",
      ...buildSearchQuery(search, ["bundleName"]),
    };

    const result = await paginateQuery(Bundle, searchQuery, {
      page,
      limit,
      populate: getStandardPopulateOptions(),
    });

    return res.status(200).json(createPaginationResponse(result, "bundles"));
  } catch (error) {
    handleError(res, error, "Get dealer bundles", "Failed to fetch bundles");
  }
};

// ==================== Update Dealer Bundle ====================

export const updateDealerBundle = async (req, res) => {
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
    const bundle = await findDealerBundleById(id);
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
        description: "The requested dealer bundle does not exist.",
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
            description: `Another dealer bundle with ${minifigQuantity} minifigs already exists.`,
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

    // Recalculate unit price
    bundle.unitPrice = bundle.totalPrice / bundle.minifigQuantity;
    bundle.updatedBy = req.user._id;

    await bundle.save();
    
    // Unset features if empty (Mongoose initializes arrays as [] even if not provided)
    if (features !== undefined && !processFeatures(features)) {
      await unsetDealerFeatures(Bundle, bundle._id);
    }

    return res.status(200).json({
      success: true,
      message: "Bundle updated successfully",
      description: `The "${bundle.bundleName}" bundle has been successfully updated.`,
      bundle,
    });
  } catch (error) {
    handleError(res, error, "Update dealer bundle", "Failed to update bundle");
  }
};

// ==================== Delete Dealer Bundle ====================

export const deleteDealerBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await Bundle.findOneAndDelete({
      _id: id,
      bundleType: "dealer",
    });

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
        description: "The requested dealer bundle does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bundle deleted successfully",
      description: `The bundle has been removed from dealer options.`,
    });
  } catch (error) {
    handleError(res, error, "Delete dealer bundle", "Failed to delete bundle");
  }
};

// ==================== Create Dealer Addon ====================

export const createDealerAddon = async (req, res) => {
  try {
    const { addonName, price, description, items, isActive } = req.body;

    // Validate required fields
    if (!addonName) {
      return res.status(400).json({
        success: false,
        message: "Add-on name is required",
        description: "Please provide a name for the add-on.",
      });
    }

    // Check for existing addon with same name
    const existingAddon = await checkAddonNameConflict(addonName, "dealer");
    if (existingAddon) {
      return res.status(409).json({
        success: false,
        message: "Add-on already exists",
        description: `An add-on with the name "${addonName}" already exists for dealers.`,
      });
    }

    // Process and upload items
    const uploadedItems = await processAddonItems(items);

    const addon = await Addon.create({
      addonName: addonName.trim(),
      addonType: "dealer",
      price,
      description,
      items: uploadedItems,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    // Unset features field
    await unsetDealerFeatures(Addon, addon._id);

    return res.status(201).json({
      success: true,
      message: "Add-on created successfully",
      description: `The "${addon.addonName}" add-on is now available for dealers.`,
      addon,
    });
  } catch (error) {
    handleError(res, error, "Create dealer addon", "Failed to create add-on");
  }
};

// ==================== Get All Dealer Addons ====================

export const getAllDealerAddons = async (req, res) => {
  try {
    const { page, limit, search } = normalizePagination(req.query);

    const searchQuery = {
      addonType: "dealer",
      ...buildSearchQuery(search, ["addonName", "description"]),
    };

    const result = await paginateQuery(Addon, searchQuery, {
      page,
      limit,
      populate: getStandardPopulateOptions(),
    });

    return res.status(200).json(createPaginationResponse(result, "addons"));
  } catch (error) {
    handleError(res, error, "Get dealer addons", "Failed to fetch add-ons");
  }
};

// ==================== Update Dealer Addon ====================

export const updateDealerAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const { addonName, price, description, items, isActive } = req.body;

    // Find addon
    const addon = await findDealerAddonById(id);
    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Add-on not found",
        description: "The requested dealer add-on does not exist.",
      });
    }

    // Update fields
    if (addonName) {
      const addonNameTrimmed = addonName.trim();
      if (addonNameTrimmed !== addon.addonName) {
        const conflict = await checkAddonNameConflict(
          addonNameTrimmed,
          "dealer",
          id,
        );
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: "Name already taken",
            description: `Another dealer add-on named "${addonNameTrimmed}" already exists.`,
          });
        }
      }
      addon.addonName = addonNameTrimmed;
    }

    if (price !== undefined) addon.price = price;
    if (description !== undefined) addon.description = description;
    if (isActive !== undefined) addon.isActive = isActive;

    // Process items if provided
    if (items && Array.isArray(items)) {
      const processedItems = await processAddonItemsForUpdate(
        items,
        addon.items,
      );
      if (processedItems !== null) {
        addon.items = processedItems;
      }
    }

    addon.updatedBy = req.user._id;
    await addon.save();

    // Unset features field
    await unsetDealerFeatures(Addon, addon._id);

    return res.status(200).json({
      success: true,
      message: "Add-on updated successfully",
      description: `The "${addon.addonName}" add-on has been updated.`,
      addon,
    });
  } catch (error) {
    handleError(res, error, "Update dealer addon", "Failed to update add-on");
  }
};

// ==================== Delete Dealer Addon ====================

export const deleteDealerAddon = async (req, res) => {
  try {
    const { id } = req.params;
    const addon = await findDealerAddonById(id);

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Add-on not found",
        description: "The requested dealer add-on does not exist.",
      });
    }

    // Delete all images from items
    await cleanUpImages(addon.items);

    await Addon.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Add-on deleted successfully",
      description: "The add-on has been removed from dealer options.",
    });
  } catch (error) {
    handleError(res, error, "Delete dealer addon", "Failed to delete add-on");
  }
};

// ==================== Create Dealer Extra Bag ====================

export const createDealerExtraBag = async (req, res) => {
  try {
    const { subCollectionId, price, isActive } = req.body;

    // Validate required fields
    if (!subCollectionId) {
      return res.status(400).json({
        success: false,
        message: "Sub-collection ID is required",
        description: "Please select a part category.",
      });
    }

    // Check for existing extra bag with same sub-collection
    const existing = await checkExtraBagConflict(subCollectionId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Price already set",
        description: "Pricing for this part category has already been defined.",
      });
    }

    const extraBag = await DealerExtraBag.create({
      subCollectionId,
      price,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Bag pricing set successfully",
      description: "Extra bag pricing has been added for this category.",
      extraBag,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Create dealer extra bag",
      "Failed to set bag pricing",
    );
  }
};

// ==================== Get All Dealer Extra Bags ====================

export const getAllDealerExtraBags = async (req, res) => {
  try {
    const { page, limit, search } = normalizePagination(req.query);

    const searchQuery = {};

    if (search) {
      // Find sub-collections matching the search name
      const matchingSubCollections = await SubCollection.find({
        subCollectionName: { $regex: search, $options: "i" },
      }).select("_id");

      const subCollectionIds = matchingSubCollections.map((sc) => sc._id);
      searchQuery.subCollectionId = { $in: subCollectionIds };
    }

    const result = await paginateQuery(DealerExtraBag, searchQuery, {
      page,
      limit,
      populate: [
        { path: "subCollectionId", select: "subCollectionName" },
        ...getStandardPopulateOptions(),
      ],
    });

    return res.status(200).json(createPaginationResponse(result, "extraBags"));
  } catch (error) {
    handleError(
      res,
      error,
      "Get dealer extra bags",
      "Failed to fetch bag pricing",
    );
  }
};

// ==================== Update Dealer Extra Bag ====================

export const updateDealerExtraBag = async (req, res) => {
  try {
    const { id } = req.params;
    const { subCollectionId, price, isActive } = req.body;

    const extraBag = await DealerExtraBag.findById(id);

    if (!extraBag) {
      return res.status(404).json({
        success: false,
        message: "Extra bag not found",
        description: "The requested extra bag pricing entry does not exist.",
      });
    }

    // Update fields
    if (subCollectionId) {
      if (subCollectionId !== extraBag.subCollectionId.toString()) {
        const conflict = await checkExtraBagConflict(subCollectionId, id);
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: "Pricing already exists",
            description:
              "Pricing for this sub-collection has already been set elsewhere.",
          });
        }
      }
      extraBag.subCollectionId = subCollectionId;
    }

    if (price !== undefined) extraBag.price = price;
    if (isActive !== undefined) extraBag.isActive = isActive;
    extraBag.updatedBy = req.user._id;

    await extraBag.save();

    return res.status(200).json({
      success: true,
      message: "Bag pricing updated successfully",
      description: "The extra bag pricing details have been updated.",
      extraBag,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Update dealer extra bag",
      "Failed to update bag pricing",
    );
  }
};

// ==================== Delete Dealer Extra Bag ====================

export const deleteDealerExtraBag = async (req, res) => {
  try {
    const { id } = req.params;
    const extraBag = await DealerExtraBag.findByIdAndDelete(id);

    if (!extraBag) {
      return res.status(404).json({
        success: false,
        message: "Extra bag not found",
        description: "The requested bag pricing entry does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bag pricing deleted successfully",
      description: "Pricing for this category has been removed.",
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Delete dealer extra bag",
      "Failed to delete bag pricing",
    );
  }
};

// ==================== Create Dealer Torso Bag ====================

export const createDealerTorsoBag = async (req, res) => {
  try {
    const { bagName, items, isActive } = req.body;

    // Validate required fields
    if (!bagName) {
      return res.status(400).json({
        success: false,
        message: "Bag name is required",
        description: "Please provide a name for the torso bag.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
        description: "Please add torso designs to this bag.",
      });
    }

    // Get required quantity and validate items
    const minRequired = await getMinRequiredQuantity();
    const validation = validateTorsoItems(items, minRequired);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        description: validation.description,
      });
    }

    // Check for existing bag with same name
    const existing = await checkTorsoBagNameConflict(bagName);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Bag already exists",
        description: `A torso bag named "${bagName}" already exists.`,
      });
    }

    // Process and upload items
    const uploadedItems = await processTorsoBagItems(items);

    const torsoBag = await DealerTorsoBag.create({
      bagName: bagName.trim(),
      items: uploadedItems,
      minQuantity: minRequired,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Torso bag created successfully",
      description: `The "${torsoBag.bagName}" bag has been created with ${torsoBag.items.length} designs.`,
      torsoBag,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Create dealer torso bag",
      "Failed to create torso bag",
    );
  }
};

// ==================== Get All Dealer Torso Bags ====================

export const getAllDealerTorsoBags = async (req, res) => {
  try {
    const { page, limit, search } = normalizePagination(req.query);

    const searchQuery = buildSearchQuery(search, ["bagName"]);

    const result = await paginateQuery(DealerTorsoBag, searchQuery, {
      page,
      limit,
      populate: getStandardPopulateOptions(),
    });

    return res.status(200).json(createPaginationResponse(result, "bags"));
  } catch (error) {
    handleError(
      res,
      error,
      "Get dealer torso bags",
      "Failed to fetch torso bags",
    );
  }
};

// ==================== Update Dealer Torso Bag ====================

export const updateDealerTorsoBag = async (req, res) => {
  try {
    const { id } = req.params;
    const { bagName, items, isActive } = req.body;

    const torsoBag = await DealerTorsoBag.findById(id);

    if (!torsoBag) {
      return res.status(404).json({
        success: false,
        message: "Torso bag not found",
        description: "The requested torso bag does not exist.",
      });
    }

    // Update fields
    if (bagName) {
      const bagNameTrimmed = bagName.trim();
      if (bagNameTrimmed.toLowerCase() !== torsoBag.bagName.toLowerCase()) {
        const conflict = await checkTorsoBagNameConflict(bagNameTrimmed, id);
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: "Name already taken",
            description: `Another torso bag named "${bagNameTrimmed}" already exists.`,
          });
        }
      }
      torsoBag.bagName = bagNameTrimmed;
    }

    if (isActive !== undefined) torsoBag.isActive = isActive;

    // Process items if provided
    if (items && Array.isArray(items)) {
      // Get required quantity and validate items
      const minRequired = await getMinRequiredQuantity();
      const validation = validateTorsoItems(items, minRequired);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          description: validation.description,
        });
      }

      const processedItems = await processTorsoBagItemsForUpdate(
        items,
        torsoBag.items,
      );

      torsoBag.items = processedItems;
      torsoBag.minQuantity = minRequired;
    }

    torsoBag.updatedBy = req.user._id;
    await torsoBag.save();

    return res.status(200).json({
      success: true,
      message: "Torso bag updated successfully",
      description: `The "${torsoBag.bagName}" bag has been updated.`,
      torsoBag,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Update dealer torso bag",
      "Failed to update torso bag",
    );
  }
};

// ==================== Delete Dealer Torso Bag ====================

export const deleteDealerTorsoBag = async (req, res) => {
  try {
    const { id } = req.params;
    const torsoBag = await DealerTorsoBag.findById(id);

    if (!torsoBag) {
      return res.status(404).json({
        success: false,
        message: "Torso bag not found",
        description: "The requested torso bag does not exist.",
      });
    }

    // Delete all item images
    await cleanUpImages(torsoBag.items);

    await DealerTorsoBag.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Torso bag deleted successfully",
      description: "The torso bag and its designs have been removed.",
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Delete dealer torso bag",
      "Failed to delete torso bag",
    );
  }
};

// ==================== Reorder Dealer Torso Bag Items ====================

export const reorderTorsoBagItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemOrder } = req.body;

    if (!itemOrder || !Array.isArray(itemOrder)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item order",
        description: "Please provide an array of item indices.",
      });
    }

    const torsoBag = await DealerTorsoBag.findById(id);

    if (!torsoBag) {
      return res.status(404).json({
        success: false,
        message: "Torso bag not found",
        description: "The requested torso bag does not exist.",
      });
    }

    // Validate that all indices are valid
    if (itemOrder.length !== torsoBag.items.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid item count",
        description: "The number of items in the order must match the bag.",
      });
    }

    // Reorder items based on the provided indices
    const reorderedItems = itemOrder.map((index) => torsoBag.items[index]);

    torsoBag.items = reorderedItems;
    await torsoBag.save();

    return res.status(200).json({
      success: true,
      message: "Items reordered successfully",
      description: "The torso designs have been rearranged.",
      data: torsoBag,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Reorder torso bag items",
      "Failed to reorder items",
    );
  }
};

// ==================== Dealer Access (Public Endpoints) ====================

export const getDealerBundlesForUser = async (req, res) => {
  try {
    const bundles = await Bundle.find({
      bundleType: "dealer",
      isActive: true,
    })
      .select("-createdBy -updatedBy -isActive -__v")
      .sort({ minifigQuantity: 1 });

    return res.status(200).json({
      success: true,
      bundles,
    });
  } catch (error) {
    handleError(res, error, "Get user bundles", "Failed to fetch bundles");
  }
};

export const getDealerAddonsForUser = async (req, res) => {
  try {
    const addons = await Addon.find({ addonType: "dealer", isActive: true })
      .select("-createdBy -updatedBy -isActive -__v")
      .populate("items.color", "colorName colorType hexCode")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      addons,
    });
  } catch (error) {
    handleError(res, error, "Get user addons", "Failed to fetch addons");
  }
};

export const getDealerExtraBagsForUser = async (req, res) => {
  try {
    const extraBags = await DealerExtraBag.find({ isActive: true })
      .populate("subCollectionId", "subCollectionName")
      .select("-createdBy -updatedBy -isActive -__v")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      extraBags,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Get user extra bags",
      "Failed to fetch extra bags",
    );
  }
};

export const getDealerTorsoBagsForUser = async (req, res) => {
  try {
    const torsoBags = await DealerTorsoBag.find({ isActive: true })
      .select("-createdBy -updatedBy -isActive -__v")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      torsoBags,
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Get user torso bags",
      "Failed to fetch torso bags",
    );
  }
};
