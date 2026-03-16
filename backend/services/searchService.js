import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Collection from "../models/collection.model.js";
import SubCollection from "../models/subCollection.model.js";
import Color from "../models/color.model.js";
import SkillLevel from "../models/skillLevel.model.js";
import { buildSearchQuery } from "../utils/pagination.js";

// ------------------------ Constants --------------------------------

const GLOBAL_SEARCH_LIMIT = 10; // Max results per category

// ------------------------ Search a Single Model (Shared Helper) ----------------

export const searchModel = async (
  Model,
  searchFields,
  search,
  selectFields,
  extraFilter = {},
) => {
  const query = buildSearchQuery(search, searchFields);
  if (Object.keys(query).length === 0) return [];

  return Model.find({ ...query, ...extraFilter })
    .select(selectFields)
    .limit(GLOBAL_SEARCH_LIMIT)
    .lean();
};

// ------------------------ Fetch All Search Results in Parallel ----------------

export const fetchAllSearchResults = async (searchTerm) => {
  const [
    products,
    categories,
    subCategories,
    collections,
    subCollections,
    colors,
    skillLevels,
  ] = await Promise.all([
    Product.find({
      ...buildSearchQuery(searchTerm, ["productName", "partId", "itemId"]),
      isVisible: true,
    })
      .select(
        "_id productName price discountPrice images variants productType colorId secondaryColorId",
      )
      .populate([
        { path: "colorId", select: "colorName" },
        { path: "secondaryColorId", select: "colorName" },
        { path: "variants.colorId", select: "colorName" },
        { path: "variants.secondaryColorId", select: "colorName" },
      ])
      .limit(GLOBAL_SEARCH_LIMIT)
      .lean(),
    searchModel(Category, ["categoryName"], searchTerm, "_id categoryName", {
      isActive: { $ne: false },
    }),
    searchModel(
      SubCategory,
      ["subCategoryName"],
      searchTerm,
      "_id subCategoryName categoryId",
      { isActive: { $ne: false } },
    ),
    searchModel(
      Collection,
      ["collectionName"],
      searchTerm,
      "_id collectionName",
      { isActive: { $ne: false } },
    ),
    searchModel(
      SubCollection,
      ["subCollectionName"],
      searchTerm,
      "_id subCollectionName collectionId image",
      { isActive: { $ne: false } },
    ),
    searchModel(Color, ["colorName"], searchTerm, "_id colorName hexCode", {
      isActive: { $ne: false },
    }),
    searchModel(
      SkillLevel,
      ["skillLevelName"],
      searchTerm,
      "_id skillLevelName",
      { isActive: { $ne: false } },
    ),
  ]);

  return {
    products,
    categories,
    subCategories,
    collections,
    subCollections,
    colors,
    skillLevels,
  };
};

// ------------------------ Process Product Results for Display ----------------

export const processProductResults = (products) => {
  return products
    .filter(
      (p) => p.productType === "standalone" || p.productType === "variant",
    )
    .map((product) => {
      let displayImage = null;
      let colorName = null;
      let secondaryColorName = null;

      if (product.productType === "standalone") {
        displayImage = product.images?.[0]?.url || null;
        colorName = product.colorId?.colorName || null;
        secondaryColorName = product.secondaryColorId?.colorName || null;
      } else if (
        product.productType === "variant" &&
        product.variants?.length > 0
      ) {
        const firstVariant = product.variants[0];
        displayImage = firstVariant?.image?.url || null;
        colorName = firstVariant?.colorId?.colorName || null;
        secondaryColorName = firstVariant?.secondaryColorId?.colorName || null;
      }

      return {
        _id: product._id,
        productName: product.productName,
        price: product.price,
        discountPrice: product.discountPrice,
        displayImage,
        colorName,
        secondaryColorName,
      };
    });
};

// ------------------------ Format Sub-Collection Results ----------------

export const formatSubCollectionResults = (subCollections) => {
  return subCollections.map((sc) => ({
    _id: sc._id,
    subCollectionName: sc.subCollectionName,
    collectionId: sc.collectionId,
    image: sc.image?.url || null,
  }));
};
