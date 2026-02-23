import { useState, useCallback, useMemo } from "react";
import {
  useGetUserOrdersQuery,
  useGetOrderConfigQuery,
} from "@/redux/api/authApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { getOrderStatusConfig, buildOrderTabs } from "@/constant/orderData";
import { formatDate, formatCurrency } from "@/utils/formatting";

const MAX_ORDER_THUMBNAILS = 5;

const usePurchase = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState("all");

  const queryParams = {
    page,
    limit,
    ...(activeTab !== "all" && { status: activeTab }),
  };

  const {
    data: ordersResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetUserOrdersQuery(queryParams);
  const { data: configData } = useGetOrderConfigQuery();

  const orderTabs = useMemo(
    () => buildOrderTabs(configData?.statuses),
    [configData?.statuses],
  );

  const { items: orders, totalPages } = extractPaginatedData(
    ordersResponse,
    "orders",
  );

  const orderCards = useMemo(
    () =>
      orders.map((order) => {
        const statusConfig = getOrderStatusConfig(order);
        const invoiceLabel =
          order.payment?.stripeInvoiceNumber || order._id?.substring(0, 7);
        const createdAt = formatDate(order.createdAt);
        const refundedAt = formatDate(order.refund?.completedAt);
        const refundAmount = formatCurrency(
          order.refund?.amount ?? order.payment?.totalAmount,
        );
        const showTrackingInfo =
          order.status === "shipped" && Boolean(order.shipping?.trackingLink);
        const showRefundInitiatedInfo = order.refund?.status === "pending";
        const showRefundedInfo = order.refund?.status === "completed";

        const orderItems = order.items ?? [];
        const thumbnails = orderItems
          .slice(0, MAX_ORDER_THUMBNAILS)
          .map((item, index) => ({
            id: item._id ?? `${order._id}-${index}`,
            productName: item.productName,
            imageUrl: item.imageUrl,
          }));
        const overflowCount = Math.max(
          0,
          orderItems.length - MAX_ORDER_THUMBNAILS,
        );

        return {
          orderId: order._id,
          detailUrl: `/checkout/success?order_id=${order._id}`,
          statusConfig,
          invoiceLabel,
          createdAt,
          thumbnails,
          overflowCount,
          itemCount: orderItems.length,
          totalAmount: formatCurrency(order.payment?.totalAmount),
          showTrackingInfo,
          trackingCarrier: order.shipping?.carrier || null,
          showRefundInitiatedInfo,
          showRefundedInfo,
          refundAmount,
          refundedAt,
        };
      }),
    [orders],
  );

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;
  const showPagination = totalPages > 1;

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1)
        start = Math.max(1, end - maxVisible + 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  }, [page, totalPages]);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => setPage(newPage), []);

  return {
    // Data
    orderCards,
    orderTabs,

    // State & Setters
    activeTab,
    page,

    // Pagination
    totalPages,
    pageNumbers,
    isFirstPage,
    isLastPage,
    showPagination,

    // Handlers
    handleTabChange,
    handlePageChange,

    // Status
    isLoading,
    isFetching,
    isError,
  };
};

export default usePurchase;
