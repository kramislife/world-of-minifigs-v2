import express from "express";
import {
  getPublicProducts,
  getPublicProductById,
  getPublicCategories,
  getPublicCollections,
  getPublicColors,
  getPublicSkillLevels,
} from "../controllers/productController.js";
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

// Public reward routes
router.get("/reward/bundles", getRewardBundlesForUser);
router.get("/reward/addons", getRewardAddonsForUser);

// Public product routes
router.get("/", getPublicProducts);
router.get("/:id", getPublicProductById);

export default router;
