import express from "express";
import {
  getPublicProducts,
  getPublicProductById,
  getPublicCategories,
  getPublicCollections,
  getPublicColors,
  getPublicSkillLevels,
} from "../controllers/productController.js";

const router = express.Router();

// Public filter routes
router.get("/filters/categories", getPublicCategories);
router.get("/filters/collections", getPublicCollections);
router.get("/filters/colors", getPublicColors);
router.get("/filters/skill-levels", getPublicSkillLevels);

// Public product routes
router.get("/", getPublicProducts);
router.get("/:id", getPublicProductById);

export default router;
