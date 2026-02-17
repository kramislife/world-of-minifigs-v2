import Stripe from "stripe";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import {
  CART_POPULATE_ORDER,
  CART_POPULATE_CHECKOUT,
  POPULATE_COLORS_NAMES_ONLY,
} from "../utils/cartPopulate.js";
import {
  decrementProductStock,
  decrementProductStockForItems,
  extractShippingAddress,
  buildStripeLineItem,
  buildOrderItem,
} from "../utils/paymentHelpers.js";
import {
  getCartItemInfoForOrder,
  parseVariantIndex,
} from "../utils/productItemUtils.js";

//------------------------------------------------ Helpers ------------------------------------------

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const STRIPE_SESSION_CONFIG = {
  mode: "payment",
  automatic_tax: { enabled: true },
  invoice_creation: { enabled: true },
  shipping_address_collection: {
    allowed_countries: ["US"],
  },
};

//---------------------------------------- Create Order from Stripe Session -----------------------------------
async function buildOrderFromCart(cart) {
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.productId;
    if (!product) continue;

    const { price, discount, discountPrice, productName, imageUrl } =
      getCartItemInfoForOrder(product, item);
    orderItems.push(
      buildOrderItem({
        productId: product._id,
        productName,
        variantIndex: item.variantIndex,
        quantity: Number(item.quantity) || 1,
        price,
        discount,
        discountPrice,
        imageUrl,
      }),
    );
  }
  return orderItems;
}

async function buildOrderFromDirectMetadata(metadata) {
  const productId = metadata?.productId;
  const variantIndex = parseVariantIndex(metadata?.variantIndex);
  const quantity = Number(metadata?.quantity) || 1;

  if (!productId) return null;

  const product = await Product.findById(productId)
    .populate(POPULATE_COLORS_NAMES_ONLY)
    .lean();

  if (!product) return null;

  const item = { productType: product.productType, variantIndex, quantity };
  const { price, discount, discountPrice, productName, imageUrl } =
    getCartItemInfoForOrder(product, item);

  return [
    buildOrderItem({
      productId: product._id,
      productName,
      variantIndex,
      quantity,
      price,
      discount,
      discountPrice,
      imageUrl,
    }),
  ];
}

async function createOrderFromStripeSession(session) {
  const existingOrder = await Order.findOne({ stripeSessionId: session.id });
  if (existingOrder) return { order: existingOrder, created: false };

  const userId = session.client_reference_id;
  const orderType = session.metadata?.orderType || "product";

  if (orderType !== "product") return null;

  const isDirect = session.metadata?.source === "direct";
  let orderItems = [];
  let stockItems = [];

  if (isDirect) {
    orderItems = await buildOrderFromDirectMetadata(session.metadata);
    if (!orderItems?.length) {
      console.error(
        "createOrderFromStripeSession: direct metadata invalid for user",
        userId,
      );
      return null;
    }
    stockItems = orderItems.map((o) => ({
      productId: o.productId,
      variantIndex: o.variantIndex,
      quantity: o.quantity,
    }));
  } else {
    const cart = await Cart.findOne({ userId }).populate(CART_POPULATE_ORDER);
    if (!cart?.items?.length) {
      console.error(
        "createOrderFromStripeSession: cart empty for user",
        userId,
      );
      return null;
    }
    orderItems = await buildOrderFromCart(cart);
    if (!orderItems.length) {
      console.error(
        "createOrderFromStripeSession: no valid items for user",
        userId,
      );
      return null;
    }
  }

  const shippingAddress = extractShippingAddress(session);
  const subtotal =
    Math.round(orderItems.reduce((s, i) => s + i.totalPrice, 0) * 100) / 100;
  const amountSubtotal =
    Math.round(session.amount_subtotal ?? subtotal * 100) / 100;
  const amountTotal = Math.round(session.amount_total ?? subtotal * 100) / 100;
  const rawTax =
    (session.total_details?.amount_tax ?? 0) / 100 ||
    Math.max(0, amountTotal - amountSubtotal);
  const taxAmount = Math.round(rawTax * 100) / 100;
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
    stripePaymentIntentId: session.payment_intent?.id || session.payment_intent,
    stripeInvoiceNumber: session.invoice?.number,
    invoiceUrl: session.invoice?.hosted_invoice_url || undefined,
    ...(shippingAddress && { shippingAddress }),
  });

  if (isDirect) {
    await decrementProductStockForItems(stockItems);
  } else {
    const cart = await Cart.findOne({ userId }).populate(CART_POPULATE_ORDER);
    await decrementProductStock(cart);
    await Cart.findOneAndDelete({ userId });
  }
  return { order, created: true };
}

//----------------------------------- Build line items for direct product checkout ------------------------------------------
async function buildLineItemsForDirectProduct(body) {
  const { productId, variantIndex: rawVariantIndex, quantity } = body;

  if (!productId) {
    return {
      error: {
        status: 400,
        message: "Product is required",
        description: "Please select a product to checkout.",
      },
    };
  }

  const product = await Product.findById(productId)
    .populate(POPULATE_COLORS_NAMES_ONLY)
    .lean();

  if (!product) {
    return {
      error: {
        status: 404,
        message: "Product not found",
        description: "The selected product does not exist.",
      },
    };
  }

  if (!product.isActive) {
    return {
      error: {
        status: 400,
        message: "Product unavailable",
        description: "This product is not available for purchase.",
      },
    };
  }

  const isVariant = product.productType === "variant";
  const variantIndex = parseVariantIndex(rawVariantIndex);

  if (isVariant && variantIndex === null) {
    return {
      error: {
        status: 400,
        message: "Variant required",
        description: "Please select a color or variant before checkout.",
      },
    };
  }

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const variant = isVariant ? product.variants?.[variantIndex] : null;
  const stock = isVariant ? (variant?.stock ?? 0) : (product.stock ?? 0);

  if (stock < qty) {
    return {
      error: {
        status: 400,
        message: "Insufficient stock",
        description: "Not enough stock available for this item.",
      },
    };
  }

  const item = {
    productType: product.productType,
    variantIndex: isVariant ? variantIndex : null,
    quantity: qty,
  };
  const lineItem = buildStripeLineItem(product, item);

  return {
    lineItems: [lineItem],
    metadata: {
      orderType: "product",
      source: "direct",
      productId: productId.toString(),
      variantIndex: String(variantIndex ?? ""),
      quantity: String(qty),
    },
  };
}

//----------------------------------- Create Checkout Session ------------------------------------------
export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};
    const { productId } = body;

    let lineItems;
    let metadata = { orderType: "product" };

    if (productId) {
      const result = await buildLineItemsForDirectProduct(body);
      if (result.error) {
        return res.status(result.error.status).json({
          success: false,
          message: result.error.message,
          description: result.error.description,
        });
      }
      lineItems = result.lineItems;
      metadata = result.metadata;
    } else {
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

      lineItems = [];
      for (const item of cart.items) {
        const product = item.productId;
        if (!product?.isActive) continue;
        lineItems.push(buildStripeLineItem(product, item));
      }

      if (!lineItems.length) {
        return res.status(400).json({
          success: false,
          message: "No valid items in cart",
          description:
            "Some items may be unavailable. Please update your cart.",
        });
      }
    }

    const session = await getStripe().checkout.sessions.create({
      ...STRIPE_SESSION_CONFIG,
      line_items: lineItems,
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: FRONTEND_URL,
      client_reference_id: userId.toString(),
      customer_email: req.user.email,
      payment_intent_data: {
        receipt_email: req.user.email,
      },
      metadata,
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

    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["invoice"],
    });
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
      const session = await stripe.checkout.sessions.retrieve(rawSession.id, {
        expand: ["invoice"],
      });

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
