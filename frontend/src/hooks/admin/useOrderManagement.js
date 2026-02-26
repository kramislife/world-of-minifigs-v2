import { useState, useCallback, useMemo, useEffect } from "react";
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
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { sanitizeString, sanitizeOptional } from "@/utils/formatting";
import { validateOrderStatusUpdate } from "@/utils/validation";

const useOrderManagement = () => {
  const crud = useAdminCrud({
    initialFormData: {},
    createFn: null,
    updateFn: null,
    deleteFn: null,
  });

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
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

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
    if (
      !validateOrderStatusUpdate({
        selectedOrder,
        newStatus,
        carrier,
        trackingNumber,
        trackingLink,
        cancelReason,
      })
    )
      return;

    try {
      const result = await updateOrderStatus({
        id: selectedOrder._id,
        status: newStatus,
        ...(sanitizeOptional(carrier) && {
          carrier: sanitizeString(carrier),
        }),
        ...(sanitizeOptional(trackingNumber) && {
          trackingNumber: sanitizeString(trackingNumber),
        }),
        ...(sanitizeOptional(trackingLink) && {
          trackingLink: sanitizeString(trackingLink),
        }),
        ...(sanitizeOptional(cancelReason) && {
          reason: sanitizeString(cancelReason),
        }),
        ...(sanitizeOptional(cancelNotes) && {
          notes: sanitizeString(cancelNotes),
        }),
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
    ...crud,
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
