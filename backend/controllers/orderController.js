import Order from "../models/order.model.js";
import {
  normalizePagination,
  buildSearchQuery,
  paginateQuery,
  createPaginationResponse,
} from "../utils/pagination.js";

//------------------------------------------------ Helpers ------------------------------------------

const buildOrderSearchQuery = (search) => {
  if (!search) return {};

  return buildSearchQuery(search, [
    "email",
    "shippingAddress.name",
    "status",
    "stripeInvoiceNumber",
    "items.productName",
  ]);
};

//------------------------------------------------ Get All Orders (Admin) ------------------------------------------

export const getAllOrders = async (req, res) => {
  try {
    // Normalize pagination and search parameters from query string
    const { page, limit, search } = normalizePagination(req.query);

    const query = buildOrderSearchQuery(search);

    const result = await paginateQuery(Order, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      // Hide heavy/internal fields from list view
      select: "-metadata -stripeSessionId -stripePaymentIntentId -__v",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    });

    return res.status(200).json(createPaginationResponse(result, "orders"));
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get Single Order (Admin) ------------------------------------------

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
        description: "Please provide a valid order ID.",
      });
    }

    const order = await Order.findById(id)
      .populate({
        path: "userId",
        select: "firstName lastName",
      })
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        description: "The requested order does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
