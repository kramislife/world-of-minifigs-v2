import express from "express";
import {
  getPublicProducts,
  getPublicProductById,
  getPublicRelatedProducts,
  getPublicCategories,
  getPublicCollections,
  getPublicColors,
  getPublicSkillLevels,
} from "../controllers/productController.js";
import { globalSearch } from "../controllers/searchController.js";
import { getPublicBanners } from "../controllers/bannerController.js";
import {
  getRewardBundlesForUser,
  getRewardAddonsForUser,
} from "../controllers/rewardController.js";

const router = express.Router();

// Public filter routes
router.get("/filters/categories", getPublicCategories);
router.get("/filters/collections", getPublicCollections);
router.get("/filters/colors", getPublicColors);
router.get("/filters/skill-levels", getPublicSkillLevels);
router.get("/banners", getPublicBanners);

// Global search route
router.get("/search", globalSearch);

// Public reward routes
router.get("/reward/bundles", getRewardBundlesForUser);
router.get("/reward/addons", getRewardAddonsForUser);

// Public product routes
router.get("/", getPublicProducts);
router.get("/:id", getPublicProductById);
router.get("/:id/related", getPublicRelatedProducts);

export default router;
