import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  refreshToken,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/authController.js";
import { sendContactMessage } from "../controllers/contactFormController.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authentication & Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/contact", sendContactMessage);

// Private Account/User routes (Authenticated)
router.get("/me", authenticate, getCurrentUser);

// Cart routes
router
  .route("/cart")
  .get(authenticate, getCart)
  .post(authenticate, addToCart)
  .delete(authenticate, clearCart);

router.post("/cart/sync", authenticate, syncCart);

router
  .route("/cart/item")
  .put(authenticate, updateCartItem)
  .delete(authenticate, removeCartItem);

export default router;
