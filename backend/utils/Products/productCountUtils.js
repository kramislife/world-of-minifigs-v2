import Product from "../../models/product.model.js";

// Get product counts for categories and subcategories
export const getCategoryCounts = async () => {
  const categoryCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$categoryIds" },
    { $group: { _id: "$categoryIds", count: { $sum: 1 } } },
  ]);

  const subCategoryCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$subCategoryIds" },
    { $group: { _id: "$subCategoryIds", count: { $sum: 1 } } },
  ]);

  const categoryCountMap = new Map(
    categoryCounts.map((item) => [item._id.toString(), item.count]),
  );
  const subCategoryCountMap = new Map(
    subCategoryCounts.map((item) => [item._id.toString(), item.count]),
  );

  return { categoryCountMap, subCategoryCountMap };
};

// Get product counts for collections and subcollections
export const getCollectionCounts = async () => {
  const collectionCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$collectionIds" },
    { $group: { _id: "$collectionIds", count: { $sum: 1 } } },
  ]);

  const subCollectionCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$subCollectionIds" },
    { $group: { _id: "$subCollectionIds", count: { $sum: 1 } } },
  ]);

  const collectionCountMap = new Map(
    collectionCounts.map((item) => [item._id.toString(), item.count]),
  );
  const subCollectionCountMap = new Map(
    subCollectionCounts.map((item) => [item._id.toString(), item.count]),
  );

  return { collectionCountMap, subCollectionCountMap };
};

// Get product counts for colors (standalone + variants)
export const getColorCounts = async () => {
  const standaloneColorCounts = await Product.aggregate([
    {
      $match: {
        isActive: true,
        productType: "standalone",
        colorId: { $exists: true },
      },
    },
    { $group: { _id: "$colorId", count: { $sum: 1 } } },
  ]);

  const variantColorCounts = await Product.aggregate([
    {
      $match: {
        isActive: true,
        productType: "variant",
        "variants.colorId": { $exists: true },
      },
    },
    { $unwind: "$variants" },
    { $group: { _id: "$variants.colorId", count: { $sum: 1 } } },
  ]);

  // Combine counts from standalone and variants
  const colorCountMap = new Map();

  standaloneColorCounts.forEach((item) => {
    const colorId = item._id.toString();
    colorCountMap.set(colorId, (colorCountMap.get(colorId) || 0) + item.count);
  });

  variantColorCounts.forEach((item) => {
    const colorId = item._id.toString();
    colorCountMap.set(colorId, (colorCountMap.get(colorId) || 0) + item.count);
  });

  return colorCountMap;
};

// Get product counts for skill levels
export const getSkillLevelCounts = async () => {
  const skillLevelCounts = await Product.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$skillLevelIds" },
    { $group: { _id: "$skillLevelIds", count: { $sum: 1 } } },
  ]);

  const skillLevelCountMap = new Map(
    skillLevelCounts.map((item) => [item._id.toString(), item.count]),
  );

  return skillLevelCountMap;
};
