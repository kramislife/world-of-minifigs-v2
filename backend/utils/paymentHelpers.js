import Product from "../models/product.model.js";

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

export const decrementProductStock = async (cart) => {
  for (const item of cart.items) {
    const product = item.productId;
    if (!product) continue;

    const quantity = Number(item.quantity) || 1;
    const productId = product._id || product;

    if (item.variantIndex != null) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { [`variants.${item.variantIndex}.stock`]: -quantity },
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }
  }
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
