import Stripe from "stripe";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import {
  CART_POPULATE_ORDER,
  CART_POPULATE_CHECKOUT,
} from "../utils/cartPopulate.js";
import {
  decrementProductStock,
  extractShippingAddress,
  getFullSessionIfNeeded,
} from "../utils/paymentHelpers.js";
import { getCartItemInfoForOrder } from "../utils/productItemUtils.js";

//------------------------------------------------ Helpers ------------------------------------------

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const STRIPE_SESSION_CONFIG = {
  mode: "payment",
  automatic_tax: { enabled: true },
  shipping_address_collection: {
    allowed_countries: ["US", "CA", "GB", "AU"],
  },
};

//---------------------------------------- Create Order from Stripe Session -----------------------------------
async function createOrderFromStripeSession(session) {
  const existingOrder = await Order.findOne({ stripeSessionId: session.id });
  if (existingOrder) return { order: existingOrder, created: false };

  const userId = session.client_reference_id;
  const orderType = session.metadata?.orderType || "product";

  if (orderType !== "product") return null;

  const cart = await Cart.findOne({ userId }).populate(CART_POPULATE_ORDER);

  if (!cart?.items?.length) {
    console.error("createOrderFromStripeSession: cart empty for user", userId);
    return null;
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) continue;

    const { price, discount, productName, imageUrl } = getCartItemInfoForOrder(
      product,
      item,
    );
    const quantity = Number(item.quantity) || 1;
    const discountPrice = price * quantity;
    subtotal += discountPrice;

    orderItems.push({
      productId: product._id,
      productName,
      variantIndex: item.variantIndex,
      quantity,
      price,
      discount: discount || undefined,
      discountPrice,
      imageUrl: imageUrl || undefined,
    });
  }

  if (!orderItems.length) {
    console.error(
      "createOrderFromStripeSession: no valid items for user",
      userId,
    );
    return null;
  }

  const shippingAddress = extractShippingAddress(session);
  const amountSubtotal = (session.amount_subtotal ?? subtotal * 100) / 100;
  const amountTotal = (session.amount_total ?? subtotal * 100) / 100;
  const taxAmount =
    (session.total_details?.amount_tax ?? 0) / 100 ||
    Math.max(0, amountTotal - amountSubtotal);
  const email = session.customer_details?.email || session.customer_email;

  const order = await Order.create({
    userId,
    email: email || undefined,
    orderType: "product",
    items: orderItems,
    subtotal: amountSubtotal,
    taxAmount,
    totalAmount: amountTotal,
    status: "paid",
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
    ...(shippingAddress && { shippingAddress }),
  });

  await decrementProductStock(cart);
  await Cart.findOneAndDelete({ userId });
  return { order, created: true };
}

//----------------------------------- Create Checkout Session ------------------------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate(
      CART_POPULATE_CHECKOUT,
    );

    if (!cart?.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
        description: "Add items to your cart before checkout.",
      });
    }

    const lineItems = [];
    for (const item of cart.items) {
      const product = item.productId;
      if (!product?.isActive) continue;

      const { price, productName, imageUrl } = getCartItemInfoForOrder(
        product,
        item,
      );
      const quantity = Number(item.quantity) || 1;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            ...(imageUrl && { images: [imageUrl] }),
          },
          unit_amount: Math.round(price * 100),
          tax_behavior: "exclusive",
        },
        quantity,
      });
    }

    if (!lineItems.length) {
      return res.status(400).json({
        success: false,
        message: "No valid items in cart",
        description: "Some items may be unavailable. Please update your cart.",
      });
    }

    const session = await getStripe().checkout.sessions.create({
      ...STRIPE_SESSION_CONFIG,
      line_items: lineItems,
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: FRONTEND_URL,
      client_reference_id: userId.toString(),
      metadata: { orderType: "product" },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      description:
        error?.message || "An unexpected error occurred. Please try again.",
    });
  }
};

//----------------------------------- Confirm Order (Success Page) -------------------------------------------
export const confirmOrder = async (req, res) => {
  try {
    const sessionId = req.query.session_id || req.body?.session_id;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    const userId = req.user._id.toString();
    if (session.client_reference_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "This session does not belong to you",
      });
    }

    const result = await createOrderFromStripeSession(session);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Could not create order",
        description: "Cart may be empty or session invalid.",
      });
    }

    return res.status(200).json({
      success: true,
      order: result.order,
      created: result.created,
    });
  } catch (error) {
    console.error("Confirm order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm order",
      description: error?.message || "An unexpected error occurred.",
    });
  }
};

//------------------------------------------------ Stripe Webhook ------------------------------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return res.status(500).json({ received: false });
    }
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const rawSession = event.data.object;
      const session = await getFullSessionIfNeeded(rawSession, stripe);

      try {
        await createOrderFromStripeSession(session);
      } catch (err) {
        console.error("Webhook: error creating order:", err);
        return res.status(500).json({ received: false });
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).json({ received: false });
  }
};
