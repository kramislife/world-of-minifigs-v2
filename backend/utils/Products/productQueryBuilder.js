import mongoose from "mongoose";
import Category from "../../models/category.model.js";
import SubCategory from "../../models/subCategory.model.js";
import Collection from "../../models/collection.model.js";
import SubCollection from "../../models/subCollection.model.js";
import Color from "../../models/color.model.js";
import SkillLevel from "../../models/skillLevel.model.js";
import { buildSearchQuery } from "../pagination.js";

// Build sort object from sortBy string
export const buildSortObject = (sortBy) => {
  const sortMap = {
    name_asc: { productName: 1 },
    name_desc: { productName: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    date_asc: { createdAt: 1 },
    date_desc: { createdAt: -1 },
  };
  return sortMap[sortBy] || { createdAt: -1 }; // Default to newest first
};

// Parse comma-separated IDs or array into array, validating ObjectId format
export const parseIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((id) => mongoose.Types.ObjectId.isValid(id));
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
  }
  return [];
};

// Build search query for products
export const buildProductSearchQuery = async (search) => {
  if (!search) return {};

  const productSearchFields = ["productName", "partId", "itemId"];
  const productQuery = buildSearchQuery(search, productSearchFields);

  // Search in related entities to get matching IDs
  const [
    matchingCategories,
    matchingSubCategories,
    matchingCollections,
    matchingSubCollections,
    matchingColors,
    matchingSkillLevels,
  ] = await Promise.all([
    Category.find(buildSearchQuery(search, ["categoryName"]))
      .select("_id")
      .lean(),
    SubCategory.find(buildSearchQuery(search, ["subCategoryName"]))
      .select("_id")
      .lean(),
    Collection.find(buildSearchQuery(search, ["collectionName"]))
      .select("_id")
      .lean(),
    SubCollection.find(buildSearchQuery(search, ["subCollectionName"]))
      .select("_id")
      .lean(),
    Color.find(buildSearchQuery(search, ["colorName"]))
      .select("_id")
      .lean(),
    SkillLevel.find(buildSearchQuery(search, ["skillLevelName"]))
      .select("_id")
      .lean(),
  ]);

  const matchingCategoryIds = matchingCategories.map((cat) => cat._id);
  const matchingSubCategoryIds = matchingSubCategories.map((sub) => sub._id);
  const matchingCollectionIds = matchingCollections.map((col) => col._id);
  const matchingSubCollectionIds = matchingSubCollections.map((sub) => sub._id);
  const matchingColorIds = matchingColors.map((color) => color._id);
  const matchingSkillLevelIds = matchingSkillLevels.map((skill) => skill._id);

  const orConditions = [];
  if (Object.keys(productQuery).length > 0) {
    orConditions.push(productQuery);
  }
  if (matchingCategoryIds.length > 0) {
    orConditions.push({ categoryIds: { $in: matchingCategoryIds } });
  }
  if (matchingSubCategoryIds.length > 0) {
    orConditions.push({ subCategoryIds: { $in: matchingSubCategoryIds } });
  }
  if (matchingCollectionIds.length > 0) {
    orConditions.push({ collectionIds: { $in: matchingCollectionIds } });
  }
  if (matchingSubCollectionIds.length > 0) {
    orConditions.push({
      subCollectionIds: { $in: matchingSubCollectionIds },
    });
  }
  if (matchingColorIds.length > 0) {
    orConditions.push({
      $or: [
        { colorId: { $in: matchingColorIds } },
        { secondaryColorId: { $in: matchingColorIds } },
        { "variants.colorId": { $in: matchingColorIds } },
        { "variants.secondaryColorId": { $in: matchingColorIds } },
      ],
    });
  }
  if (matchingSkillLevelIds.length > 0) {
    orConditions.push({ skillLevelIds: { $in: matchingSkillLevelIds } });
  }

  return orConditions.length > 0 ? { $or: orConditions } : {};
};

// Build price filter query
export const buildPriceFilter = (priceMin, priceMax) => {
  if (priceMin === null && priceMax === null) return null;

  const priceConditions = [];

  if (priceMin !== null && priceMax !== null) {
    priceConditions.push({
      $or: [
        {
          $and: [
            { discountPrice: { $exists: true, $ne: null } },
            { discountPrice: { $gte: priceMin, $lte: priceMax } },
          ],
        },
        {
          $and: [
            {
              $or: [
                { discountPrice: { $exists: false } },
                { discountPrice: null },
              ],
            },
            { price: { $gte: priceMin, $lte: priceMax } },
          ],
        },
      ],
    });
  } else if (priceMin !== null) {
    priceConditions.push({
      $or: [
        { discountPrice: { $exists: true, $ne: null, $gte: priceMin } },
        {
          $and: [
            {
              $or: [
                { discountPrice: { $exists: false } },
                { discountPrice: null },
              ],
            },
            { price: { $gte: priceMin } },
          ],
        },
      ],
    });
  } else if (priceMax !== null) {
    priceConditions.push({
      $or: [
        { discountPrice: { $exists: true, $ne: null, $lte: priceMax } },
        {
          $and: [
            {
              $or: [
                { discountPrice: { $exists: false } },
                { discountPrice: null },
              ],
            },
            { price: { $lte: priceMax } },
          ],
        },
      ],
    });
  }

  return priceConditions.length > 0 ? priceConditions[0] : null;
};

// Build complete query for public products with filters
export const buildPublicProductQuery = async (queryParams) => {
  const {
    search,
    priceMin,
    priceMax,
    categoryIds,
    subCategoryIds,
    collectionIds,
    subCollectionIds,
    colorIds,
    skillLevelIds,
  } = queryParams;

  // Base query - only active products
  let query = { isActive: true };
  const andConditions = [];

  // Build search query
  if (search) {
    const searchQuery = await buildProductSearchQuery(search);
    if (Object.keys(searchQuery).length > 0) {
      if (searchQuery.$or) {
        query.$or = searchQuery.$or;
      } else {
        Object.assign(query, searchQuery);
      }
    }
  }

  // Price filtering
  const priceFilter = buildPriceFilter(priceMin, priceMax);
  if (priceFilter) {
    andConditions.push(priceFilter);
  }

  // Category filtering
  const parsedCategoryIds = parseIds(categoryIds);
  if (parsedCategoryIds.length > 0) {
    query.categoryIds = { $in: parsedCategoryIds };
  }

  // Sub-category filtering
  const parsedSubCategoryIds = parseIds(subCategoryIds);
  if (parsedSubCategoryIds.length > 0) {
    query.subCategoryIds = { $in: parsedSubCategoryIds };
  }

  // Collection filtering
  const parsedCollectionIds = parseIds(collectionIds);
  if (parsedCollectionIds.length > 0) {
    query.collectionIds = { $in: parsedCollectionIds };
  }

  // Sub-collection filtering
  const parsedSubCollectionIds = parseIds(subCollectionIds);
  if (parsedSubCollectionIds.length > 0) {
    query.subCollectionIds = { $in: parsedSubCollectionIds };
  }

  // Color filtering (standalone or variant, including secondary colors)
  const parsedColorIds = parseIds(colorIds);
  if (parsedColorIds.length > 0) {
    const colorFilter = {
      $or: [
        { colorId: { $in: parsedColorIds } },
        { secondaryColorId: { $in: parsedColorIds } },
        { "variants.colorId": { $in: parsedColorIds } },
        { "variants.secondaryColorId": { $in: parsedColorIds } },
      ],
    };

    // Combine with existing query using $and if there's already an $or for search
    if (query.$or) {
      const searchOr = query.$or;
      delete query.$or;
      andConditions.push({ $or: searchOr }, colorFilter);
    } else {
      andConditions.push(colorFilter);
    }
  }

  // Skill level filtering
  const parsedSkillLevelIds = parseIds(skillLevelIds);
  if (parsedSkillLevelIds.length > 0) {
    query.skillLevelIds = { $in: parsedSkillLevelIds };
  }

  // Combine all $and conditions
  if (andConditions.length > 0) {
    query.$and = query.$and || [];
    query.$and.push(...andConditions);
  }

  return query;
};
