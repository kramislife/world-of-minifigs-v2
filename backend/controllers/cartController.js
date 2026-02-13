import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { CART_POPULATE } from "../utils/cartPopulate.js";
import {
  findCartItemIndex,
  formatCartItemForDisplay,
  getCartItemDisplayAndStock,
  itemMatchesCartItem,
} from "../utils/productItemUtils.js";

//------------------------------------------------ Get User Cart ------------------------------------------
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate(CART_POPULATE);

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { userId, items: [] },
      });
    }

    const formattedItems = cart.items
      .filter((item) => item.productId?.isActive)
      .map(formatCartItemForDisplay)
      .filter(Boolean)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    const subtotal = formattedItems.reduce(
      (sum, item) => sum + parseFloat(item.totalItemPrice || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      cart: {
        userId: cart.userId,
        items: formattedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        subtotalFormatted: subtotal.toFixed(2),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      description:
        "An unexpected error occurred while fetching your shopping cart.",
    });
  }
};

//------------------------------------------------ Add To Cart ------------------------------------------
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, variantIndex } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        description: "Please provide a product to add to cart.",
      });
    }

    const product = await Product.findById(productId);
    if (!product?.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        description:
          "The product you are trying to add is no longer available.",
      });
    }

    const cart =
      (await Cart.findOne({ userId })) || new Cart({ userId, items: [] });
    const itemIndex = findCartItemIndex(cart.items, productId, variantIndex);

    const addQty = Number(quantity) || 1;
    const existingQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
    const { displayName, maxStock } = getCartItemDisplayAndStock(
      product,
      product.productType,
      variantIndex,
    );

    if (maxStock < existingQty + addQty) {
      return res.status(400).json({
        success: false,
        message: "Maximum stock reached",
        description: `${displayName} has reached its maximum stock available`,
      });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += addQty;
      cart.items[itemIndex].addedAt = new Date();
    } else {
      const newItem = {
        productId,
        productName: product.productName,
        productType: product.productType,
        quantity: addQty,
      };
      if (product.productType === "variant") {
        newItem.variantIndex = variantIndex;
      }
      cart.items.push(newItem);
    }

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add item to cart" });
  }
};

//------------------------------------------------ Update Cart Item ------------------------------------------
export const updateCartItem = async (req, res) => {
  try {
    const { quantity, productId, variantIndex } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        description: "Please provide the product to update.",
      });
    }

    const parsedQty = Number(quantity);
    if (quantity == null || !Number.isInteger(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
        description: "Quantity must be a positive integer.",
      });
    }
    const qty = parsedQty;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const itemIndex = findCartItemIndex(cart.items, productId, variantIndex);
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(item.productId);
    const { displayName, maxStock } = getCartItemDisplayAndStock(
      product,
      item.productType,
      item.variantIndex,
    );

    if (!product?.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product unavailable",
        description: "This product is no longer active or available.",
      });
    }

    if (maxStock < qty) {
      return res.status(400).json({
        success: false,
        message: "Maximum stock reached",
        description: `${displayName} has reached its maximum stock (${maxStock} available).`,
      });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();
    return res.status(200).json({ success: true, message: "Quantity updated" });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

//------------------------------------------------ Remove Cart Item ------------------------------------------
export const removeCartItem = async (req, res) => {
  try {
    const { productId, variantIndex } = req.query;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => !itemMatchesCartItem(item, productId, variantIndex),
      );

      if (cart.items.length === 0) {
        await Cart.deleteOne({ _id: cart._id });
      } else {
        await cart.save();
      }
    }

    return res.status(200).json({ success: true, message: "Item removed" });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ success: false, message: "Remove failed" });
  }
};

//------------------------------------------------ Clear Cart ------------------------------------------
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    return res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Clear failed" });
  }
};

//------------------------------------------------ Sync Cart ------------------------------------------
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        description: "Items must be an array.",
      });
    }

    const newItems = [];
    for (const localItem of items) {
      const product = await Product.findById(localItem.productId);
      if (!product?.isActive) continue;

      const newItem = {
        productId: localItem.productId,
        productName: product.productName,
        productType: product.productType,
        quantity: Number(localItem.quantity) || 1,
        addedAt: new Date(),
      };
      if (product.productType === "variant") {
        newItem.variantIndex = localItem.variantIndex;
      }
      newItems.push(newItem);
    }

    const cart =
      (await Cart.findOne({ userId })) || new Cart({ userId, items: [] });
    cart.items = newItems;
    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Cart synchronized" });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({ success: false, message: "Sync failed" });
  }
};
