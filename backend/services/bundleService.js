import Bundle from "../models/bundle.model.js";
import DealerAddon from "../models/dealerAddon.model.js";
import DealerTorsoBag from "../models/dealerTorsoBag.model.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

// ------------------------ Constants ------------------------------------

const MISC_RATIO = 0.2;

// ------------------------ Quantity Helpers ------------------------------------

export const getMiscQuantity = (targetBundleSize) =>
  Math.round(targetBundleSize * MISC_RATIO);

export const getAdminTarget = (targetBundleSize) =>
  targetBundleSize - getMiscQuantity(targetBundleSize);

export const getBaseBundleSize = async (bundleType = "dealer") => {
  const lowestBundle = await Bundle.findOne({
    bundleType,
    isActive: true,
  }).sort({ minifigQuantity: 1 });
  return lowestBundle ? lowestBundle.minifigQuantity : 100;
};

// ------------------------ Torso Item Validation ------------------------------------

export const validateTorsoItems = (items, targetBundleSize) => {
  const adminTarget = getAdminTarget(targetBundleSize);
  const totalQty = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

  if (totalQty !== adminTarget) {
    return {
      isValid: false,
      message: "Invalid total quantity",
      description: `Total designs quantity must equal ${adminTarget} (${targetBundleSize} minus ${getMiscQuantity(targetBundleSize)} miscellaneous). Current total: ${totalQty}.`,
    };
  }

  return { isValid: true };
};

// ------------------------ Conflict Checks ------------------------------------

export const checkAddonNameConflict = async (addonName, excludeId = null) => {
  const query = { addonName: addonName.trim() };
  if (excludeId) query._id = { $ne: excludeId };
  return DealerAddon.findOne(query);
};

export const checkTorsoBagNameConflict = async (bagName, excludeId = null) => {
  const query = {
    bagName: { $regex: new RegExp(`^${bagName.trim()}$`, "i") },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return DealerTorsoBag.findOne(query);
};

// ------------------------ Addon Item Processing (Create) --------------------------------

export const processAddonItems = async (
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

// ------------------------ Addon Item Processing (Update) --------------------------------

export const processAddonItemsForUpdate = async (
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
    if (
      typeof itemData === "object" &&
      itemData.image &&
      itemData.image.publicId
    ) {
      processedItems.push(itemData);
    } else {
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

  const newPublicIds = processedItems
    .map((item) => item.image?.publicId)
    .filter(Boolean);
  const idsToDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

  for (const id of idsToDelete) {
    await deleteImage(id);
  }

  return processedItems;
};

// ------------------------ Torso Bag Item Processing (Create) ------------------------------

export const processTorsoBagItems = async (
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

// ------------------------ Torso Bag Item Processing (Update) ------------------------------

export const processTorsoBagItemsForUpdate = async (
  items,
  existingItems,
  folderPath = "world-of-minifigs-v2/dealers/torsos",
) => {
  const processedItems = [];
  const currentPublicIds = existingItems.map((item) => item.image.publicId);

  for (const itemData of items) {
    if (
      typeof itemData === "object" &&
      itemData.image &&
      itemData.image.publicId
    ) {
      processedItems.push(itemData);
    } else {
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

  const newPublicIds = processedItems.map((item) => item.image.publicId);
  const idsToDelete = currentPublicIds.filter(
    (id) => !newPublicIds.includes(id),
  );

  for (const id of idsToDelete) {
    await deleteImage(id);
  }

  return processedItems;
};
