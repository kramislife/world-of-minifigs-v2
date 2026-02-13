import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import SubCategory from "../../models/subCategory.model.js";
import Collection from "../../models/collection.model.js";
import SubCollection from "../../models/subCollection.model.js";
import Color from "../../models/color.model.js";

// Validate foreign key references
 
export const validateForeignKeys = async ({
  categoryIds,
  subCategoryIds,
  collectionIds,
  subCollectionIds,
  colorId,
}) => {
  const errors = [];

  if (categoryIds && categoryIds.length > 0) {
    const validCategories = await Category.countDocuments({
      _id: { $in: categoryIds },
    });
    if (validCategories !== categoryIds.length) {
      errors.push({
        field: "categoryIds",
        message: "Invalid category IDs",
        description: "One or more category IDs are invalid.",
      });
    }
  }

  if (subCategoryIds && subCategoryIds.length > 0) {
    const validSubCategories = await SubCategory.countDocuments({
      _id: { $in: subCategoryIds },
    });
    if (validSubCategories !== subCategoryIds.length) {
      errors.push({
        field: "subCategoryIds",
        message: "Invalid sub-category IDs",
        description: "One or more sub-category IDs are invalid.",
      });
    }
  }

  if (collectionIds && collectionIds.length > 0) {
    const validCollections = await Collection.countDocuments({
      _id: { $in: collectionIds },
    });
    if (validCollections !== collectionIds.length) {
      errors.push({
        field: "collectionIds",
        message: "Invalid collection IDs",
        description: "One or more collection IDs are invalid.",
      });
    }
  }

  if (subCollectionIds && subCollectionIds.length > 0) {
    const validSubCollections = await SubCollection.countDocuments({
      _id: { $in: subCollectionIds },
    });
    if (validSubCollections !== subCollectionIds.length) {
      errors.push({
        field: "subCollectionIds",
        message: "Invalid sub-collection IDs",
        description: "One or more sub-collection IDs are invalid.",
      });
    }
  }

  if (colorId) {
    const validColor = await Color.findById(colorId);
    if (!validColor) {
      errors.push({
        field: "colorId",
        message: "Invalid color ID",
        description: "The provided color ID is invalid.",
      });
    }
  }

  return errors;
};

//------------------------------------------------ Uniqueness -------------------------------------------------

export const checkProductExists = async (partId, itemId, excludeId = null) => {
  const query = {
    partId: partId.trim(),
    itemId: itemId.trim(),
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Product.findOne(query)
    .collation({ locale: "en", strength: 2 })
    .lean();
};

export const checkVariantExists = async (
  partId,
  itemId,
  excludeProductId = null,
) => {
  const query = {
    "variants.partId": partId.trim(),
    "variants.itemId": itemId.trim(),
  };

  if (excludeProductId) {
    query._id = { $ne: excludeProductId };
  }

  return await Product.findOne(query)
    .collation({ locale: "en", strength: 2 })
    .lean();
};
