import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

//------------------------------------------------ Helpers ------------------------------------------

const CART_POPULATE = {
  path: "items.productId",
  select:
    "productName price discountPrice productType variants images isActive stock colorId secondaryColorId",
  populate: [
    { path: "variants.colorId", select: "colorName hexCode" },
    { path: "variants.secondaryColorId", select: "colorName hexCode" },
    { path: "colorId", select: "colorName hexCode" },
    { path: "secondaryColorId", select: "colorName hexCode" },
  ],
};

function parseVariantIndex(value) {
  if (value == null || value === "null" || value === "undefined") return null;
  return Number(value);
}

function findCartItemIndex(items, productId, variantIndex) {
  const target = parseVariantIndex(variantIndex);
  return items.findIndex((item) => {
    const matchProduct = item.productId.toString() === productId;
    const itemV = item.variantIndex ?? null;
    return matchProduct && itemV === target;
  });
}

function getProductDisplayInfo(product, productType, variantIndex) {
  if (!product) return { displayName: "Unknown", maxStock: 0 };
  const isVariant = productType === "variant";
  const variant = isVariant ? product.variants?.[variantIndex] : null;
  const variantName =
    isVariant && variant
      ? [variant.colorId?.colorName, variant.secondaryColorId?.colorName]
          .filter(Boolean)
          .join(" / ")
      : null;
  const displayName = variantName
    ? `${product.productName} - ${variantName}`
    : product.productName;
  const maxStock = isVariant ? (variant?.stock ?? 0) : (product?.stock ?? 0);
  return { displayName, maxStock };
}

function formatCartItem(item) {
  const product = item.productId;
  const isVariant = item.productType === "variant";
  const variant = isVariant ? product.variants?.[item.variantIndex] : null;

  const price = Number(product.price) || 0;
  const discountPrice =
    product.discountPrice != null && product.discountPrice >= 0
      ? Number(product.discountPrice)
      : null;
  const effectivePrice = discountPrice ?? price;
  const hasDiscount =
    discountPrice != null && discountPrice < price && price > 0;
  const quantity = item.quantity;

  const variantColor = isVariant
    ? variant?.colorId?.colorName
    : product.colorId?.colorName;
  const secondaryColor = isVariant
    ? variant?.secondaryColorId?.colorName
    : product.secondaryColorId?.colorName;
  const colorLabel = [variantColor, secondaryColor].filter(Boolean).join(" / ");

  const formatted = {
    productId: product._id,
    productName: product.productName,
    quantity,
    productType: item.productType,
    image: isVariant ? variant?.image?.url : product.images?.[0]?.url,
    stock: isVariant ? variant?.stock : product.stock,
    variantColor: variantColor || null,
    secondaryColor: secondaryColor || null,
    colorLabel: colorLabel || null,
    displayPrice: effectivePrice.toFixed(2),
    originalPrice: price.toFixed(2),
    hasDiscount,
    totalItemPrice: (effectivePrice * quantity).toFixed(2),
    addedAt: item.addedAt,
  };
  if (isVariant) formatted.variantIndex = item.variantIndex;
  return formatted;
}

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
      .map(formatCartItem)
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
    const { displayName, maxStock } = getProductDisplayInfo(
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
      if (product.productType === "variant")
        newItem.variantIndex = variantIndex;
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

    const cart = await Cart.findOne({ userId });
    const itemIndex = findCartItemIndex(
      cart?.items ?? [],
      productId,
      variantIndex,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(item.productId);
    const { displayName, maxStock } = getProductDisplayInfo(
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

    if (maxStock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Maximum stock reached",
        description: `${displayName} has reached its maximum stock (${maxStock} available).`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
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
      const target = parseVariantIndex(variantIndex);
      cart.items = cart.items.filter((item) => {
        const matchProduct = item.productId.toString() === productId;
        const itemV = item.variantIndex ?? null;
        return !(matchProduct && itemV === target);
      });

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
