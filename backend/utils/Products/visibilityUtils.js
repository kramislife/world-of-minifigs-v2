import Product from "../../models/product.model.js";
import Collection from "../../models/collection.model.js";
import SubCollection from "../../models/subCollection.model.js";

export const recalculateVisibility = async (productFilter = {}) => {
  const products = await Product.find(productFilter)
    .select("isActive isVisible collectionIds subCollectionIds")
    .lean();

  if (products.length === 0) return;

  // Collect referenced structural entity IDs
  const collectionIdSet = new Set();
  const subCollectionIdSet = new Set();

  for (const p of products) {
    p.collectionIds?.forEach((id) => collectionIdSet.add(id.toString()));
    p.subCollectionIds?.forEach((id) => subCollectionIdSet.add(id.toString()));
  }

  // Batch-fetch entity active states
  const [collections, subCollections] = await Promise.all([
    collectionIdSet.size > 0
      ? Collection.find({ _id: { $in: [...collectionIdSet] } })
          .select("_id isActive")
          .lean()
      : [],
    subCollectionIdSet.size > 0
      ? SubCollection.find({ _id: { $in: [...subCollectionIdSet] } })
          .select("_id isActive")
          .lean()
      : [],
  ]);

  // Build id → isActive lookup maps
  const toActiveMap = (docs) =>
    new Map(docs.map((d) => [d._id.toString(), d.isActive !== false]));

  const collectionMap = toActiveMap(collections);
  const subCollectionMap = toActiveMap(subCollections);

  // Check all IDs in an array are active (empty array → true)
  const allActive = (ids, map) =>
    !ids ||
    ids.length === 0 ||
    ids.every((id) => map.get(id.toString()) !== false);

  // Determine new visibility per product and batch the updates
  const bulkOps = [];

  for (const p of products) {
    const shouldBeVisible =
      p.isActive !== false &&
      allActive(p.collectionIds, collectionMap) &&
      allActive(p.subCollectionIds, subCollectionMap);

    // Only update if the value actually changed
    if (p.isVisible !== shouldBeVisible) {
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { isVisible: shouldBeVisible } },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  return { evaluated: products.length, updated: bulkOps.length };
};

//------------------------------------------------ Cascade Helpers ------------------------------------------

// Recalculate visibility for products referencing a specific collection
export const onCollectionToggle = async (collectionId) => {
  // Products directly referencing this collection
  const directFilter = { collectionIds: collectionId };

  // Sub-collections under this collection inherit parent active state,
  // so also recalculate products referencing those sub-collections
  const childSubCollections = await SubCollection.find({ collectionId })
    .select("_id")
    .lean();
  const subCollectionIds = childSubCollections.map((sc) => sc._id);

  const filter =
    subCollectionIds.length > 0
      ? { $or: [directFilter, { subCollectionIds: { $in: subCollectionIds } }] }
      : directFilter;

  return recalculateVisibility(filter);
};

// Recalculate visibility for products referencing a specific sub-collection
export const onSubCollectionToggle = async (subCollectionId) => {
  return recalculateVisibility({ subCollectionIds: subCollectionId });
};

// Recalculate visibility for a single product (e.g. when its own isActive changes)
export const onProductToggle = async (productId) => {
  return recalculateVisibility({ _id: productId });
};
