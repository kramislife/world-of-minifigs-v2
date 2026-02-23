import mongoose from "mongoose";

export default async function addVisibilityFields() {
  const db = mongoose.connection.db;
  const results = {};

  const entityCollections = [
    "collections",
    "subcollections",
    "categories",
    "subcategories",
    "colors",
    "skilllevels",
  ];

  for (const name of entityCollections) {
    const res = await db
      .collection(name)
      .updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } },
      );

    results[name] = {
      matched: res.matchedCount,
      modified: res.modifiedCount,
    };
  }

  const products = db.collection("products");

  const activeRes = await products.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } },
  );

  const visibleRes = await products.updateMany(
    { isVisible: { $exists: false } },
    { $set: { isVisible: true } },
  );

  results.products = {
    isActive: {
      matched: activeRes.matchedCount,
      modified: activeRes.modifiedCount,
    },
    isVisible: {
      matched: visibleRes.matchedCount,
      modified: visibleRes.modifiedCount,
    },
  };

  return results;
}
