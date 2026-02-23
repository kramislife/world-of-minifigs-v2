import {
  Truck,
  PackageCheck,
  XCircle,
  Clock,
  RefreshCw,
  Check,
} from "lucide-react";

export const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    variant: "success",
    header: "Thank you for your order!",
    icon: Check,
    iconColor: "text-success bg-success/10 ring-success/20",
    description:
      "Your order has been confirmed and is now being prepared. A copy of your invoice has been sent to ",
  },
  shipped: {
    label: "Shipped",
    variant: "default",
    header: "Your order is on its way!",
    icon: Truck,
    iconColor: "text-blue-600 bg-blue-100 ring-blue-200",
    description:
      "Your package has been dispatched and is moving through the carrier’s network. You can track its progress using the tracking details below.",
  },
  delivered: {
    label: "Delivered",
    variant: "success",
    header: "Your order has been delivered!",
    icon: PackageCheck,
    iconColor: "text-success bg-success/10 ring-success/20",
    description:
      "Your package has reached its destination. We hope you’re happy with your purchase and enjoy your new items!",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    header: "Your order has been cancelled",
    icon: XCircle,
    iconColor: "text-destructive bg-destructive/10 ring-destructive/20",
    description:
      "This order will not be processed or shipped. Please see the refund details below for more information.",
  },
};

// Visual overrides for cancelled orders based on refundStatus
export const REFUND_STATUS_CONFIG = {
  pending: {
    label: "Refund Processing",
    variant: "secondary",
    header: "Refund in progress",
    icon: Clock,
    iconColor: "text-amber-600 bg-amber-100 ring-amber-200",
    description:
      "We’ve initiated your refund to your original payment method. Depending on your bank’s processing times, it may take 5–10 business days to post the credit to your account.",
  },
  completed: {
    label: "Refunded",
    variant: "outline",
    header: "Refund Confirmed",
    icon: RefreshCw,
    iconColor: "text-destructive bg-destructive/10 ring-destructive/20",
    description:
      "Your refund has been successfully processed and sent back to your original payment method. Depending on your bank’s processing times, it may take 5–10 business days for the credit to appear in your account.",
  },
};

// Resolve the effective display config for an order (handles refundStatus within cancelled)
export const getOrderStatusConfig = (order) => {
  const status = order?.status || "paid";
  if (status === "cancelled" && order?.refund?.status) {
    const refundConfig = REFUND_STATUS_CONFIG[order.refund.status];
    if (refundConfig) return refundConfig;
  }
  return STATUS_CONFIG[status] || STATUS_CONFIG.paid;
};

// Derive order tabs from fetched statuses (backend source of truth)
export const buildOrderTabs = (statuses) => {
  const base = [{ value: "all", label: "All Orders" }];
  if (!statuses) return base;
  return [
    ...base,
    ...Object.values(statuses)
      .filter((s) => s !== "failed")
      .map((s) => ({ value: s, label: STATUS_CONFIG[s]?.label || s })),
  ];
};

// Derive admin status transition options from fetched validTransitions
export const buildAdminStatusOptions = (validTransitions) => {
  if (!validTransitions) return {};
  const result = {};
  for (const [from, toList] of Object.entries(validTransitions)) {
    result[from] = toList.map((to) => ({
      value: to,
      label: `Mark as ${STATUS_CONFIG[to]?.label || to}`,
    }));
  }
  return result;
};
