import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/api/adminApi";
import { useGetOrderConfigQuery } from "@/redux/api/authApi";
import {
  extractPaginatedData,
  handleApiError,
  handleApiSuccess,
} from "@/utils/apiHelpers";
import { buildAdminStatusOptions } from "@/constant/orderData";

const useOrderManagement = () => {
  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNotes, setCancelNotes] = useState("");

  const resetStatusFields = useCallback(() => {
    setNewStatus("");
    setCarrier("");
    setTrackingNumber("");
    setTrackingLink("");
    setCancelReason("");
    setCancelNotes("");
  }, []);

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // Fetch data
  const { data: ordersResponse, isLoading: isLoadingOrders } =
    useGetOrdersQuery({
      page,
      limit,
      search: search || undefined,
    });

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();

  const { data: configData } = useGetOrderConfigQuery();

  // Derive from backend config (single source of truth)
  const adminStatusOptions = useMemo(
    () => buildAdminStatusOptions(configData?.validTransitions),
    [configData?.validTransitions],
  );

  const {
    items: orders,
    totalItems,
    totalPages,
  } = extractPaginatedData(ordersResponse, "orders");

  const columns = [
    { key: "invoice", label: "Invoice Number" },
    { key: "customer", label: "Customer" },
    { key: "email", label: "Email" },
    { key: "recipient", label: "Recipient" },
    { key: "orderType", label: "Type" },
    { key: "totalAmount", label: "Total" },
    { key: "status", label: "Status" },
    { key: "arn", label: "ARN" },
    { key: "createdAt", label: "Created At" },
    { key: "actions", label: "Actions" },
  ];

  // Pagination Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const orderReference = useMemo(() => {
    if (!selectedOrder) return "";
    return (
      selectedOrder.payment?.stripeInvoiceNumber ||
      selectedOrder._id?.substring(0, 7) ||
      ""
    );
  }, [selectedOrder]);

  // Status update modal
  const handleStatusModalChange = useCallback(
    (open) => {
      setStatusModalOpen(open);
      if (!open) {
        setSelectedOrder(null);
        resetStatusFields();
      }
    },
    [resetStatusFields],
  );

  const handleEdit = useCallback(
    (order) => {
      resetStatusFields();
      setSelectedOrder(order);
      setStatusModalOpen(true);
    },
    [resetStatusFields],
  );

  const closeStatusModal = useCallback(() => {
    handleStatusModalChange(false);
  }, [handleStatusModalChange]);

  // View modal
  const handleViewModalChange = useCallback((open) => {
    setViewModalOpen(open);
    if (!open) {
      setViewOrder(null);
    }
  }, []);

  const handleView = useCallback((order) => {
    setViewOrder(order);
    setViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    handleViewModalChange(false);
  }, [handleViewModalChange]);

  const handleUpdateStatus = useCallback(async () => {
    if (!selectedOrder) {
      toast.error("Select an order", {
        description: "Please pick an order before updating its status.",
      });
      return;
    }

    if (!newStatus) {
      toast.error("Choose a status", {
        description: "Select the next status before submitting.",
      });
      return;
    }

    if (
      newStatus === "shipped" &&
      (!carrier.trim() || !trackingNumber.trim() || !trackingLink.trim())
    ) {
      toast.error("Shipping details required", {
        description: "Carrier, tracking number, and link are mandatory.",
      });
      return;
    }

    if (newStatus === "cancelled" && !cancelReason.trim()) {
      toast.error("Cancellation reason required", {
        description: "Provide a brief reason before cancelling the order.",
      });
      return;
    }

    try {
      const result = await updateOrderStatus({
        id: selectedOrder._id,
        status: newStatus,
        ...(carrier.trim() && { carrier: carrier.trim() }),
        ...(trackingNumber.trim() && { trackingNumber: trackingNumber.trim() }),
        ...(trackingLink.trim() && { trackingLink: trackingLink.trim() }),
        ...(cancelReason.trim() && { reason: cancelReason.trim() }),
        ...(cancelNotes.trim() && { notes: cancelNotes.trim() }),
      }).unwrap();

      handleApiSuccess(result, "Order status updated");
      closeStatusModal();
    } catch (error) {
      handleApiError(error, "Failed to update order status");
    }
  }, [
    selectedOrder,
    newStatus,
    carrier,
    trackingNumber,
    trackingLink,
    cancelReason,
    cancelNotes,
    updateOrderStatus,
    closeStatusModal,
  ]);

  const handleStatusFormSubmit = useCallback(
    (event) => {
      event?.preventDefault?.();
      handleUpdateStatus();
    },
    [handleUpdateStatus],
  );

  // Get available transitions (includes cancel)
  const getAvailableTransitions = useCallback(
    (orderStatus) => {
      return adminStatusOptions[orderStatus] || [];
    },
    [adminStatusOptions],
  );

  return {
    // State
    page,
    limit,
    search,
    orders,
    totalItems,
    totalPages,
    columns,
    isLoadingOrders,
    statusModalOpen,
    selectedOrder,
    newStatus,
    carrier,
    trackingNumber,
    trackingLink,
    cancelReason,
    cancelNotes,
    isUpdatingStatus,
    viewModalOpen,
    viewOrder,
    orderReference,

    // Handlers
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    setNewStatus,
    setCarrier,
    setTrackingNumber,
    setTrackingLink,
    setCancelReason,
    setCancelNotes,
    handleEdit,
    handleView,
    handleStatusModalChange,
    handleViewModalChange,
    handleUpdateStatus,
    getAvailableTransitions,
    handleStatusFormSubmit,
  };
};

export default useOrderManagement;
