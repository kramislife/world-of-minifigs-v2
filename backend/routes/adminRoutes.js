import express from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";
import {
  createColor,
  getAllColors,
  getColorById,
  updateColor,
  deleteColor,
} from "../controllers/colorController.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorizeAdmin);

// Color CRUD routes
router.post("/colors", createColor);
router.get("/colors", getAllColors);
router.get("/colors/:id", getColorById);
router.put("/colors/:id", updateColor);
router.delete("/colors/:id", deleteColor);

// Category CRUD routes
router.post("/categories", createCategory);
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
