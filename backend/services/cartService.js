import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { CART_POPULATE } from "../utils/populateHelpers.js";
import {
  formatCartItemForDisplay,
  getCartItemDisplayAndStock,
  itemMatchesCartItem,
} from "../utils/productItemUtils.js";

// ------------------------ Cart Retrieval --------------------------------

export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate(CART_POPULATE);
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
    cart = await Cart.findById(cart._id).populate(CART_POPULATE);
  }
  return cart;
};

// ------------------------ Format Cart for Response --------------------------------

export const formatCartForResponse = (cart) => {
  if (!cart?.items?.length) {
    return { items: [], totalItems: 0, subtotal: 0, totalDiscount: 0 };
  }

  let subtotal = 0;
  let totalDiscount = 0;
  const items = [];

  for (const item of cart.items) {
    const display = formatCartItemForDisplay(item);
    if (!display) continue;

    subtotal += display.totalPrice;
    totalDiscount += display.totalDiscount;
    items.push(display);
  }

  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
  };
};

// ------------------------ Validate Product + Stock for Add-to-Cart -----------------------

export const validateProductForCart = async (productId, variantIndex, qty) => {
  const product = await Product.findById(productId)
    .populate([
      { path: "colorId", select: "colorName hexCode" },
      { path: "secondaryColorId", select: "colorName hexCode" },
      { path: "variants.colorId", select: "colorName hexCode" },
      { path: "variants.secondaryColorId", select: "colorName hexCode" },
    ])
    .lean();

  if (!product || !product.isActive) {
    return {
      error: {
        status: 404,
        message: "Product not found",
        description: "This product is no longer available.",
      },
    };
  }

  const { displayInfo, stock } = getCartItemDisplayAndStock(
    product,
    variantIndex,
  );

  if (stock < qty) {
    return {
      error: {
        status: 400,
        message: "Insufficient stock",
        description: `Only ${stock} items available.`,
      },
    };
  }

  return { product, displayInfo, stock };
};

// ------------------------ Merge Guest Cart Items into a User's Cart -----------------------

export const mergeCartItems = (existingItems, incomingItems) => {
  const merged = [...existingItems];

  for (const incoming of incomingItems) {
    const existingIdx = merged.findIndex((existing) =>
      itemMatchesCartItem(existing, incoming),
    );

    if (existingIdx !== -1) {
      merged[existingIdx].quantity = Math.max(
        merged[existingIdx].quantity,
        incoming.quantity,
      );
    } else {
      merged.push(incoming);
    }
  }

  return merged;
};
