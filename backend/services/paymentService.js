import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import {
  CART_POPULATE_ORDER,
  CART_POPULATE_CHECKOUT,
  POPULATE_COLORS_NAMES_ONLY,
} from "../utils/populateHelpers.js";
import {
  decrementProductStock,
  decrementProductStockForItems,
  extractShippingAddress,
  extractBillingDetails,
  buildStripeLineItem,
  buildOrderItem,
} from "../utils/paymentHelpers.js";
import {
  getCartItemInfoForOrder,
  parseVariantIndex,
} from "../utils/productItemUtils.js";
import { ORDER_STATUSES, REFUND_STATUSES } from "../models/order.model.js";

// ------------------------ Constants --------------------------------

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const SHIPPING_RATE_AMOUNT = 1000; // $10.00 in cents

export const STRIPE_SESSION_CONFIG = {
  mode: "payment",
  automatic_tax: { enabled: true },
  invoice_creation: { enabled: true },
  shipping_address_collection: {
    allowed_countries: ["US"],
  },
  shipping_options: [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: SHIPPING_RATE_AMOUNT, currency: "usd" },
        display_name: "Standard Shipping",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 7 },
          maximum: { unit: "business_day", value: 14 },
        },
      },
    },
  ],
};

// ------------------------ Build Order Items from Cart --------------------------------

export async function buildOrderFromCart(cart) {
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

// ------------------------ Build Order Items from Direct (Buy Now) Metadata ----------------

export async function buildOrderFromDirectMetadata(metadata) {
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

// ------------------------ Create Order from a Completed Stripe Session ----------------

export async function createOrderFromStripeSession(session) {
  const existingOrder = await Order.findOne({
    "payment.stripeSessionId": session.id,
  });
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
  const billingDetails = extractBillingDetails(session, shippingAddress);
  const subtotal =
    Math.round(orderItems.reduce((s, i) => s + i.totalPrice, 0) * 100) / 100;
  const amountSubtotal =
    Math.round(session.amount_subtotal ?? subtotal * 100) / 100;
  const amountTotal = Math.round(session.amount_total ?? subtotal * 100) / 100;
  const shippingFee =
    Math.round(session.total_details?.amount_shipping ?? 0) / 100;
  const rawTax =
    (session.total_details?.amount_tax ?? 0) / 100 ||
    Math.max(0, amountTotal - amountSubtotal - shippingFee);
  const taxAmount = Math.round(rawTax * 100) / 100;
  const email = session.customer_details?.email || session.customer_email;

  const order = await Order.create({
    userId,
    email: email || undefined,
    orderType: "product",
    items: orderItems,
    payment: {
      subtotal: amountSubtotal,
      shippingFee,
      taxAmount,
      totalAmount: amountTotal,
      paidAt: new Date(),
      stripeSessionId: session.id,
      stripePaymentIntentId:
        session.payment_intent?.id || session.payment_intent,
      stripeInvoiceNumber: session.invoice?.number,
      invoiceUrl: session.invoice?.hosted_invoice_url || undefined,
    },
    status: ORDER_STATUSES.PAID,
    ...(shippingAddress && { shipping: { address: shippingAddress } }),
    ...(billingDetails && { billing: billingDetails }),
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

// ─── Build line items for direct "Buy Now" checkout ─────────────────────────

export async function buildLineItemsForDirectProduct(body) {
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

// ------------------------ Handle Refund.Updated Webhook Event ----------------

export async function handleRefundUpdated(refund) {
  if (refund.status !== "succeeded") return;

  const paymentIntentId = refund.payment_intent;
  if (!paymentIntentId) return;

  const order = await Order.findOne({
    "payment.stripePaymentIntentId": paymentIntentId,
  });

  if (!order) return;

  // Only skip if already completed
  if (order.refund.status === REFUND_STATUSES.COMPLETED) {
    return;
  }

  order.refund.status = REFUND_STATUSES.COMPLETED;
  order.refund.completedAt = new Date();
  order.cancellation.isLocked = false;
  order.refund.stripeRefundId = refund.id;
  order.refund.amount = refund.amount / 100;

  // Store ARN if available
  const cardDetails = refund.destination_details?.card;
  if (
    cardDetails?.reference_status === "available" &&
    cardDetails?.reference &&
    !order.refund.arn
  ) {
    order.refund.arn = cardDetails.reference;
  }

  await order.save();
}

// ------------------------ Build Line Items from a User's Cart ----------------

export async function buildCartLineItems(userId) {
  const cart = await Cart.findOne({ userId }).populate(CART_POPULATE_CHECKOUT);

  if (!cart?.items?.length) {
    return {
      error: {
        status: 400,
        message: "Cart is empty",
        description: "Add items to your cart before checkout.",
      },
    };
  }

  const lineItems = [];
  for (const item of cart.items) {
    const product = item.productId;
    if (!product?.isActive) continue;
    lineItems.push(buildStripeLineItem(product, item));
  }

  if (!lineItems.length) {
    return {
      error: {
        status: 400,
        message: "No valid items in cart",
        description: "Some items may be unavailable. Please update your cart.",
      },
    };
  }

  return { lineItems, metadata: { orderType: "product" } };
}
