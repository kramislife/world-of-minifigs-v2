import Order from "../../models/order.model.js";
import { REFUND_STATUSES } from "../../constants/orderConstants.js";

// ------------ Refund Webhook Handler ------------

export async function handleRefundUpdated(refund) {
  if (refund.status !== "succeeded") return;

  const paymentIntentId = refund.payment_intent;
  if (!paymentIntentId) return;

  const order = await Order.findOne({
    "payment.stripePaymentIntentId": paymentIntentId,
  });

  if (!order) return;

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
