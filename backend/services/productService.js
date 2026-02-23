import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Collection from "../models/collection.model.js";
import SubCollection from "../models/subCollection.model.js";
import { buildSearchQuery } from "../utils/pagination.js";

// ------------------------ Populate Configurations --------------------------------

export const PRODUCT_DETAILS_POPULATE = [
  { path: "categoryIds", select: "categoryName" },
  { path: "subCategoryIds", select: "subCategoryName" },
  { path: "collectionIds", select: "collectionName" },
  { path: "subCollectionIds", select: "subCollectionName" },
  { path: "colorId", select: "colorName hexCode" },
  { path: "secondaryColorId", select: "colorName hexCode" },
  { path: "skillLevelIds", select: "skillLevelName" },
  { path: "createdBy", select: "firstName lastName username" },
  { path: "variants.colorId", select: "colorName hexCode" },
  { path: "variants.secondaryColorId", select: "colorName hexCode" },
];

export const PRODUCT_DETAILS_POPULATE_WITH_UPDATED = [
  ...PRODUCT_DETAILS_POPULATE,
  { path: "updatedBy", select: "firstName lastName username" },
];

export const PUBLIC_LISTING_SELECT =
  "_id productName price discount discountPrice productType createdAt images variants stock";

export const PUBLIC_LISTING_POPULATE = [
  { path: "categoryIds", select: "categoryName" },
  { path: "subCategoryIds", select: "subCategoryName" },
  { path: "collectionIds", select: "collectionName" },
  { path: "subCollectionIds", select: "subCollectionName" },
  { path: "colorId", select: "colorName hexCode" },
  { path: "secondaryColorId", select: "colorName hexCode" },
  { path: "skillLevelIds", select: "skillLevelName" },
  { path: "variants.colorId", select: "colorName hexCode" },
  { path: "variants.secondaryColorId", select: "colorName hexCode" },
];

// ------------------------ Apply Populate Chain to a Mongoose Query ----------------

export const applyPublicPopulate = (query) => {
  for (const pop of PUBLIC_LISTING_POPULATE) {
    query = query.populate(pop.path, pop.select);
  }
  return query;
};

// ---------------------- Generic Words to Exclude from Name-Based Product Matching --------

export const NAME_MATCH_GENERIC_WORDS = [
  "legs",
  "torso",
  "head",
  "hair",
  "helmet",
  "cape",
  "armor",
  "shield",
  "weapon",
  "the",
  "with",
  "and",
  "for",
];

// ------------------------ Build Admin Product Search Query ----------------

export const buildProductSearchQuery = async (search) => {
  if (!search) return {};

  const baseQuery = buildSearchQuery(search, [
    "productName",
    "partId",
    "itemId",
  ]);
  if (Object.keys(baseQuery).length === 0) return {};

  // Also search by related entity names
  const [
    matchCategories,
    matchSubCategories,
    matchCollections,
    matchSubCollections,
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
  ]);

  const orConditions = [baseQuery];
  if (matchCategories.length > 0)
    orConditions.push({
      categoryIds: { $in: matchCategories.map((c) => c._id) },
    });
  if (matchSubCategories.length > 0)
    orConditions.push({
      subCategoryIds: { $in: matchSubCategories.map((s) => s._id) },
    });
  if (matchCollections.length > 0)
    orConditions.push({
      collectionIds: { $in: matchCollections.map((c) => c._id) },
    });
  if (matchSubCollections.length > 0)
    orConditions.push({
      subCollectionIds: { $in: matchSubCollections.map((s) => s._id) },
    });

  return orConditions.length === 1 ? baseQuery : { $or: orConditions };
};

// ------------------------ Discount Price Calculation ----------------

export const calculateDiscountPrice = (price, discount) => {
  if (!discount || discount <= 0) return null;
  return Math.round(price * (1 - discount / 100) * 100) / 100;
};
