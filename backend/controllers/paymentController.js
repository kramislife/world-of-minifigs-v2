import { getStripe } from "../utils/stripe.js";
import Order from "../models/order.model.js";
import {
  createOrderFromStripeSession,
  buildLineItemsForDirectProduct,
  buildCartLineItems,
  handleRefundUpdated,
  FRONTEND_URL,
  STRIPE_SESSION_CONFIG,
} from "../services/paymentService.js";

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
      const result = await buildCartLineItems(userId);
      if (result.error) {
        return res.status(result.error.status).json({
          success: false,
          message: result.error.message,
          description: result.error.description,
        });
      }
      lineItems = result.lineItems;
      metadata = result.metadata;
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
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const order = await Order.findOne({
      "payment.stripeSessionId": sessionId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found yet. Please refresh.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Confirm order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load order",
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

    switch (event.type) {
      case "checkout.session.completed": {
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
        break;
      }
      case "refund.updated": {
        try {
          await handleRefundUpdated(event.data.object);
        } catch (err) {
          console.error("Webhook: error processing refund:", err);
          return res.status(500).json({ received: false });
        }
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).json({ received: false });
  }
};
