import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

//------------------------------------------------ Get User Cart ------------------------------------------
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select:
        "productName price discountPrice productType variants images isActive stock colorId secondaryColorId",
      populate: [
        {
          path: "variants.colorId",
          select: "colorName hexCode",
        },
        {
          path: "colorId",
          select: "colorName hexCode",
        },
        {
          path: "secondaryColorId",
          select: "colorName hexCode",
        },
      ],
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          userId,
          items: [],
        },
      });
    }

    const formattedItems = cart.items
      .filter((item) => item.productId && item.productId.isActive)
      .map((item) => {
        const product = item.productId;
        const isVariant = item.productType === "variant";
        const variant = isVariant
          ? product.variants?.[item.variantIndex]
          : null;

        const formattedItem = {
          productId: product._id,
          productName: product.productName,
          price: product.price,
          discountPrice: product.discountPrice,
          quantity: item.quantity,
          productType: item.productType,
          image: isVariant ? variant?.image?.url : product.images?.[0]?.url,
          stock: isVariant ? variant?.stock : product.stock,
          variantColor: isVariant
            ? variant?.colorId?.colorName
            : product.colorId?.colorName,
          secondaryColor: !isVariant
            ? product.secondaryColorId?.colorName
            : null,
          addedAt: item.addedAt,
        };

        // Only include variantIndex for variant type products
        if (isVariant) {
          formattedItem.variantIndex = item.variantIndex;
        }

        return formattedItem;
      })
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return res.status(200).json({
      success: true,
      cart: {
        userId: cart.userId,
        items: formattedItems,
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
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        description:
          "The product you are trying to add is no longer available.",
      });
    }

    let cart =
      (await Cart.findOne({ userId })) || new Cart({ userId, items: [] });

    const itemIndex = cart.items.findIndex((item) => {
      const isProductIdMatch = item.productId.toString() === productId;
      // Handle null/undefined comparison consistently
      const itemVIndex = item.variantIndex ?? null;
      const targetVIndex =
        variantIndex === null || variantIndex === undefined
          ? null
          : Number(variantIndex);
      return isProductIdMatch && itemVIndex === targetVIndex;
    });

    const addQty = Number(quantity) || 1;
    const existingQty = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
    const maxStock =
      product.productType === "variant"
        ? product.variants?.[variantIndex]?.stock
        : product.stock;

    if (maxStock < existingQty + addQty) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
        description: `Only ${maxStock} units available.`,
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

      // Only include variantIndex if it's a variant product
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
    const { quantity, productId } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });

    const itemIndex = cart.items.findIndex((item) => {
      const isProductIdMatch = item.productId.toString() === productId;
      const itemVIndex = item.variantIndex ?? null;
      const targetVIndex =
        req.body.variantIndex === null || req.body.variantIndex === undefined
          ? null
          : Number(req.body.variantIndex);
      return isProductIdMatch && itemVIndex === targetVIndex;
    });

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(item.productId);
    const maxStock =
      item.productType === "variant"
        ? product?.variants?.[item.variantIndex]?.stock
        : product?.stock;

    if (!product || !product.isActive || maxStock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Stock unavailable" });
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
    const productId = req.query.productId;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      const targetVIndex =
        req.query.variantIndex === "null" ||
        req.query.variantIndex === "undefined" ||
        req.query.variantIndex === undefined
          ? null
          : Number(req.query.variantIndex);

      cart.items = cart.items.filter((item) => {
        const isProductIdMatch = item.productId.toString() === productId;
        const itemVIndex = item.variantIndex ?? null;
        return !(isProductIdMatch && itemVIndex === targetVIndex);
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

    let cart =
      (await Cart.findOne({ userId })) || new Cart({ userId, items: [] });

    for (const localItem of items) {
      const dbItem = cart.items.find(
        (i) =>
          i.productId.toString() === localItem.productId &&
          i.variantIndex === localItem.variantIndex,
      );

      if (dbItem) {
        dbItem.quantity += Number(localItem.quantity) || 1;
      } else {
        const product = await Product.findById(localItem.productId);
        if (product?.isActive) {
          const newItem = {
            productId: localItem.productId,
            productName: product.productName,
            productType: product.productType,
            quantity: Number(localItem.quantity) || 1,
          };

          if (product.productType === "variant") {
            newItem.variantIndex = localItem.variantIndex;
          }

          cart.items.push(newItem);
        }
      }
    }

    await cart.save();
    return res
      .status(200)
      .json({ success: true, message: "Cart synchronized" });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({ success: false, message: "Sync failed" });
  }
};
