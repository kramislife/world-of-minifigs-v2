import Product from "../models/product.model.js";
import { getCartItemInfoForOrder } from "./productItemUtils.js";

export const extractShippingAddress = (session) => {
  const shippingDetails = session.shipping_details;
  const customerDetails = session.customer_details;
  const addr = shippingDetails?.address || customerDetails?.address;
  if (!addr) return undefined;

  const name = shippingDetails?.name || customerDetails?.name;
  return {
    name: name || undefined,
    line1: addr.line1,
    line2: addr.line2 || undefined,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postal_code,
    country: addr.country,
  };
};

const decrementStockForItem = async (productId, variantIndex, quantity) => {
  const qty = Number(quantity) || 1;
  const id = productId?._id ?? productId;
  if (!id) return;

  if (variantIndex != null) {
    await Product.findByIdAndUpdate(id, {
      $inc: { [`variants.${variantIndex}.stock`]: -qty },
    });
  } else {
    await Product.findByIdAndUpdate(id, {
      $inc: { stock: -qty },
    });
  }
};

export const decrementProductStock = async (cart) => {
  for (const item of cart.items) {
    const product = item.productId;
    if (!product) continue;
    await decrementStockForItem(
      product._id || product,
      item.variantIndex,
      item.quantity,
    );
  }
};

// Decrement stock for explicit items (e.g. direct product checkout).
export const decrementProductStockForItems = async (items) => {
  for (const { productId, variantIndex, quantity } of items) {
    await decrementStockForItem(productId, variantIndex, quantity);
  }
};

// Compute the effective unit price: use discountPrice if set, otherwise calculate from percentage.
const computeUnitPrice = (price, discount, discountPrice) => {
  if (discountPrice != null && discountPrice >= 0) return Number(discountPrice);
  const disc = discount || 0;
  return Math.round(price * (1 - disc / 100) * 100) / 100;
};

// Build a saved order item from raw product info.
export const buildOrderItem = ({
  productId,
  productName,
  variantIndex,
  quantity,
  price,
  discount,
  discountPrice,
  imageUrl,
}) => {
  const basePrice = price;
  const disc = discount || 0;
  const unitPrice = computeUnitPrice(basePrice, disc, discountPrice);
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  return {
    productId,
    productName,
    variantIndex,
    quantity,
    basePrice,
    discount: disc,
    unitPrice,
    totalPrice,
    imageUrl: imageUrl || undefined,
  };
};

// Build a Stripe line_item from product + item (productType, variantIndex, quantity).
export const buildStripeLineItem = (product, item) => {
  const { price, discount, discountPrice, productName, imageUrl } =
    getCartItemInfoForOrder(product, item);
  const quantity = Number(item?.quantity) || 1;
  const unitAmount = Math.round(
    computeUnitPrice(price, discount, discountPrice) * 100,
  );

  return {
    price_data: {
      currency: "usd",
      product_data: {
        name: productName,
        ...(imageUrl && { images: [imageUrl] }),
      },
      unit_amount: unitAmount,
      tax_behavior: "exclusive",
    },
    quantity,
  };
};

export const getFullSessionIfNeeded = async (rawSession, stripe) => {
  if (rawSession?.id && !rawSession?.shipping_details?.address) {
    try {
      return await stripe.checkout.sessions.retrieve(rawSession.id);
    } catch (e) {
      console.warn(
        "Could not retrieve full session, using payload:",
        e?.message,
      );
    }
  }
  return rawSession;
};
