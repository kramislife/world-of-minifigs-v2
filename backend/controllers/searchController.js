import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Collection from "../models/collection.model.js";
import SubCollection from "../models/subCollection.model.js";
import Color from "../models/color.model.js";
import SkillLevel from "../models/skillLevel.model.js";
import { buildSearchQuery } from "../utils/pagination.js";

//------------------------------------------------ Helpers ------------------------------------------

const GLOBAL_SEARCH_LIMIT = 10; // Max results per category

// Search a single model by name field and return limited results.
const searchModel = async (Model, searchFields, search, selectFields) => {
  const query = buildSearchQuery(search, searchFields);
  if (Object.keys(query).length === 0) return [];

  return Model.find(query)
    .select(selectFields)
    .limit(GLOBAL_SEARCH_LIMIT)
    .lean();
};

//------------------------------------------------ Global Search ------------------------------------------

export const globalSearch = async (req, res) => {
  try {
    const { search } = req.query;

    // Validate search term
    const searchTerm = search ? String(search).trim() : "";
    if (!searchTerm || searchTerm.length < 2) {
      return res.status(200).json({
        success: true,
        results: {
          products: [],
          categories: [],
          subCategories: [],
          collections: [],
          subCollections: [],
          colors: [],
          skillLevels: [],
        },
      });
    }

    // Search all models in parallel for performance
    const [
      products,
      categories,
      subCategories,
      collections,
      subCollections,
      colors,
      skillLevels,
    ] = await Promise.all([
      Product.find(
        buildSearchQuery(searchTerm, ["productName", "partId", "itemId"]),
      )
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
      searchModel(Category, ["categoryName"], searchTerm, "_id categoryName"),
      searchModel(
        SubCategory,
        ["subCategoryName"],
        searchTerm,
        "_id subCategoryName categoryId",
      ),
      searchModel(
        Collection,
        ["collectionName"],
        searchTerm,
        "_id collectionName",
      ),
      searchModel(
        SubCollection,
        ["subCollectionName"],
        searchTerm,
        "_id subCollectionName collectionId image",
      ),
      searchModel(Color, ["colorName"], searchTerm, "_id colorName hexCode"),
      searchModel(
        SkillLevel,
        ["skillLevelName"],
        searchTerm,
        "_id skillLevelName",
      ),
    ]);

    // Process products to get a display image and color
    const processedProducts = products
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
          secondaryColorName =
            firstVariant?.secondaryColorId?.colorName || null;
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

    return res.status(200).json({
      success: true,
      results: {
        products: processedProducts,
        categories,
        subCategories,
        collections,
        subCollections: subCollections.map((sc) => ({
          _id: sc._id,
          subCollectionName: sc.subCollectionName,
          collectionId: sc.collectionId,
          image: sc.image?.url || null,
        })),
        colors,
        skillLevels,
      },
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform search",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
