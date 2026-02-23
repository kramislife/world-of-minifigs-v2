import mongoose from "mongoose";

/* ------------------------------------------- Constants ---------------------------------------- */

export const CANCELLATION_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Shipping cost is too high",
  "Incorrect shipping information",
  "Item no longer needed",
  "Other",
];

export const ORDER_STATUSES = {
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  FAILED: "failed",
};

export const REFUND_STATUSES = {
  NONE: "none",
  PENDING: "pending",
  COMPLETED: "completed",
};

export const VALID_STATUS_TRANSITIONS = {
  [ORDER_STATUSES.PAID]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
};

/* ------------------------------------------- Item Schema ---------------------------------------- */

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    variantIndex: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
  },
  { _id: false },
);

/* ----------------------------------------- Order Schema ------------------------------------------- */

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, trim: true },
    orderType: {
      type: String,
      enum: ["product", "dealer", "reward"],
      default: "product",
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.PAID,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    payment: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, default: 0, min: 0 },
      taxAmount: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      stripeSessionId: { type: String },
      stripePaymentIntentId: { type: String },
      stripeInvoiceNumber: { type: String },
      invoiceUrl: { type: String },
      paidAt: { type: Date },
    },
    refund: {
      status: {
        type: String,
        enum: Object.values(REFUND_STATUSES),
        default: REFUND_STATUSES.NONE,
      },
      amount: { type: Number, min: 0 },
      initiatedAt: { type: Date },
      completedAt: { type: Date },
      stripeRefundId: { type: String },
      arn: { type: String }, // Acquirer Reference Number (admin-only)
    },
    shipping: {
      address: {
        name: { type: String },
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
      carrier: { type: String },
      trackingNumber: { type: String },
      trackingLink: { type: String },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    billing: {
      cardHolderName: { type: String },
      country: { type: String },
    },
    cancellation: {
      reason: { type: String },
      notes: { type: String },
      cancelledAt: { type: Date },
      cancelledByRole: {
        type: String,
        enum: ["user", "admin"],
      },
      cancelledById: {
        type: mongoose.Schema.Types.ObjectId,
      },
      isLocked: { type: Boolean, default: false },
      lockExpiresAt: { type: Date },
    },
  },
  { timestamps: true },
);

/* ------------------------------------------- Indexes --------------------------------------------- */

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "refund.status": 1 });
orderSchema.index({ "payment.stripePaymentIntentId": 1 });
orderSchema.index({ "payment.stripeSessionId": 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
