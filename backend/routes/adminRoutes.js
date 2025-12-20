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

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorizeAdmin);

// Color CRUD routes
router.post("/colors", createColor);
router.get("/colors", getAllColors);
router.get("/colors/:id", getColorById);
router.put("/colors/:id", updateColor);
router.delete("/colors/:id", deleteColor);

export default router;
