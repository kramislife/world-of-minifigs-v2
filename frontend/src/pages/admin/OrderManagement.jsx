import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
} from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import ViewAdminDialog from "@/components/table/ViewAdminDialog";
import {
  formatCurrency,
  formatDate,
  display,
  formatFullName,
} from "@/utils/formatting";
import StatusBadge from "@/components/shared/StatusBadge";
import { getOrderStatusConfig } from "@/constant/orderData";
import useOrderManagement from "@/hooks/admin/useOrderManagement";

const OrderManagement = () => {
  const {
    page,
    limit,
    search,
    orders,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
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
    getAvailableTransitions,
    handleStatusModalChange,
    handleViewModalChange,
    handleStatusFormSubmit,
  } = useOrderManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Order Management"
        description="View and manage all orders placed by users"
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search orders..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
        columns={columns}
        data={orders}
        isLoading={isLoadingOrders}
        renderRow={(order) => {
          const invoice =
            order.payment?.stripeInvoiceNumber || order._id?.substring(0, 7);
          const transitions = getAvailableTransitions(order.status);
          const statusConfig = getOrderStatusConfig(order);

          return (
            <>
              {/* Invoice */}
              <TableCell maxWidth="140px" className="font-mono text-xs">
                {invoice}
              </TableCell>

              {/* Customer */}
              <TableCell maxWidth="180px">
                {formatFullName(order.userId)}
              </TableCell>

              {/* Email */}
              <TableCell maxWidth="220px">{display(order.email)}</TableCell>

              {/* Recipient */}
              <TableCell maxWidth="180px">
                {display(order.shipping?.address?.name)}
              </TableCell>

              {/* Order Type */}
              <TableCell className="capitalize">
                {display(order.orderType)}
              </TableCell>

              {/* Total */}
              <TableCell>
                <span className="font-semibold">
                  {formatCurrency(order.payment?.totalAmount)}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <StatusBadge variant={statusConfig.variant}>
                  {statusConfig.label}
                </StatusBadge>
              </TableCell>

              {/* ARN */}
              <TableCell maxWidth="200px" className="font-mono text-xs">
                {order.refund?.status === "completed" && order.refund?.arn
                  ? order.refund.arn
                  : "—"}
              </TableCell>

              {/* Created At */}
              <TimestampCells createdAt={order.createdAt} />

              {/* Actions */}
              <ActionsColumn
                onView={() => handleView(order)}
                onEdit={
                  transitions.length > 0 ? () => handleEdit(order) : undefined
                }
              />
            </>
          );
        }}
      />

      {/* Update Order Status Dialog */}
      <AddUpdateItemDialog
        open={statusModalOpen}
        onOpenChange={handleStatusModalChange}
        mode="edit"
        title="Update Order Status"
        description={orderReference ? `Order #${orderReference}` : undefined}
        onSubmit={handleStatusFormSubmit}
        isLoading={isUpdatingStatus}
        submitButtonText={
          newStatus === "cancelled" ? "Confirm Cancellation" : "Update Status"
        }
        className="sm:max-w-lg"
      >
        <div className="space-y-4">
          {/* Status Select */}
          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableTransitions(selectedOrder?.status).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shipping Fields */}
          {newStatus === "shipped" && (
            <>
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="USPS, UPS, FedEx..."
                />
              </div>

              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="1Z999AA10123456784"
                />
              </div>

              <div className="space-y-2">
                <Label>Tracking Link</Label>
                <Input
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                  placeholder="https://tracking.example.com/..."
                />
              </div>
            </>
          )}

          {/* Cancellation Fields */}
          {newStatus === "cancelled" && (
            <>
              <div className="space-y-2">
                <Label>Reason for cancellation</Label>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Out of stock, customer request..."
                  disabled={isUpdatingStatus}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional notes</Label>
                <Textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Optional internal notes..."
                  disabled={isUpdatingStatus}
                  rows={3}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                A reason is required. This will initiate a refund.
              </p>
            </>
          )}
        </div>
      </AddUpdateItemDialog>

      {/* View Order Details Dialog */}
      <ViewAdminDialog
        open={viewModalOpen}
        onOpenChange={handleViewModalChange}
        title="Order Details"
      >
        {/* ── Order Information ── */}
        <section className="space-y-2">
          <Label className="font-semibold text-xs uppercase">
            Order Information
          </Label>
          <div className="rounded-lg border divide-y text-sm">
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Invoice Number</span>
              {viewOrder?.payment?.invoiceUrl &&
              viewOrder?.payment?.stripeInvoiceNumber ? (
                <a
                  href={viewOrder.payment.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2"
                >
                  {viewOrder.payment.stripeInvoiceNumber}
                </a>
              ) : (
                <span className="text-xs">
                  {viewOrder?.payment?.stripeInvoiceNumber || "—"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Status</span>
              <div className="flex items-center">
                <StatusBadge variant={getOrderStatusConfig(viewOrder).variant}>
                  {getOrderStatusConfig(viewOrder).label}
                </StatusBadge>
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Order Type</span>
              <span className="text-xs capitalize">
                {viewOrder?.orderType || "—"}
              </span>
            </div>
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Paid At</span>
              <span className="text-xs">
                {formatDate(viewOrder?.payment?.paidAt)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Customer ── */}
        <section className="space-y-2">
          <Label className="font-semibold text-xs uppercase">Customer</Label>
          <div className="rounded-lg border divide-y text-sm">
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Name</span>
              <span className="text-xs">
                {formatFullName(viewOrder?.userId)}
              </span>
            </div>
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Email</span>
              <span className="text-xs break-all">
                {viewOrder?.email || "—"}
              </span>
            </div>
          </div>
        </section>

        {/* ── Billing Details ── */}
        {(viewOrder?.billing?.cardHolderName ||
          viewOrder?.billing?.country) && (
          <section className="space-y-2">
            <Label className="font-semibold text-xs uppercase">
              Billing Details
            </Label>
            <div className="rounded-lg border divide-y text-sm">
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Cardholder Name</span>
                <span className="text-xs">
                  {viewOrder.billing.cardHolderName || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Country</span>
                <span className="text-xs">
                  {viewOrder.billing.country || "—"}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ── Shipping Address ── */}
        {viewOrder?.shipping?.address && (
          <section className="space-y-2">
            <Label className="font-semibold text-xs uppercase">
              Shipping Address
            </Label>
            <div className="rounded-lg border divide-y text-sm">
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Recipient</span>
                <span className="text-xs">
                  {viewOrder?.shipping?.address?.name || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Address</span>
                <span className="text-xs">
                  {[
                    viewOrder?.shipping?.address?.line1,
                    viewOrder?.shipping?.address?.line2,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">City</span>
                <span className="text-xs">
                  {viewOrder?.shipping?.address?.city || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">State</span>
                <span className="text-xs">
                  {viewOrder?.shipping?.address?.state || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Postal Code</span>
                <span className="text-xs">
                  {viewOrder?.shipping?.address?.postalCode || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Country</span>
                <span className="text-xs">
                  {viewOrder?.shipping?.address?.country || "—"}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ── Shipping & Tracking ── */}
        {viewOrder?.shipping?.carrier && (
          <section className="space-y-2">
            <Label className="font-semibold text-xs uppercase">
              Shipping & Tracking
            </Label>
            <div className="rounded-lg border divide-y text-sm">
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Carrier</span>
                <span className="text-xs">
                  {viewOrder.shipping.carrier || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Tracking Number</span>
                <span className="text-xs">
                  {viewOrder.shipping.trackingNumber || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs truncate">
                  Tracking Link
                </span>
                <a
                  href={viewOrder.shipping.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2 break-all"
                >
                  {viewOrder.shipping.trackingLink || "—"}
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── Order Items ── */}
        <section className="space-y-2">
          <Label className="font-semibold text-xs uppercase">
            Items ({viewOrder?.items?.length || 0})
          </Label>
          <div className="rounded-lg border divide-y text-sm">
            {viewOrder?.items?.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_auto_auto] gap-4 items-center p-3"
              >
                <span className="text-xs truncate">{item.productName}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                  {item.unitPrice < item.basePrice && (
                    <span className="text-[10px] line-through text-muted-foreground/50 ml-1">
                      {formatCurrency(item.basePrice)}
                    </span>
                  )}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Payment Summary ── */}
        <section className="space-y-2">
          <Label className="font-semibold text-xs uppercase">
            Payment Summary
          </Label>
          <div className="rounded-lg border divide-y text-sm">
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Subtotal</span>
              <span className="text-xs">
                {formatCurrency(viewOrder?.payment?.subtotal)}
              </span>
            </div>
            <div className="grid grid-cols-[140px_1fr] p-3">
              <span className="font-semibold text-xs">Shipping Fee</span>
              <span className="text-xs">
                {formatCurrency(viewOrder?.payment?.shippingFee)}
              </span>
            </div>
            {viewOrder?.payment?.taxAmount > 0 && (
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Tax</span>
                <span className="text-xs">
                  {formatCurrency(viewOrder.payment.taxAmount)}
                </span>
              </div>
            )}
            <div className="grid grid-cols-[140px_1fr] p-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(viewOrder?.payment?.totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* ── Refund ── */}
        {viewOrder?.refund?.status && viewOrder.refund.status !== "none" && (
          <section className="space-y-2">
            <Label className="font-semibold text-xs uppercase">Refund</Label>
            <div className="rounded-lg border divide-y text-sm">
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Status</span>
                <span className="text-xs capitalize">
                  {viewOrder.refund.status || "—"}
                </span>
              </div>
              {viewOrder.refund.amount != null && (
                <div className="grid grid-cols-[140px_1fr] p-3">
                  <span className="font-semibold text-xs">Amount</span>
                  <span className="text-xs">
                    {formatCurrency(viewOrder.refund.amount)}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Cancellation ── */}
        {viewOrder?.cancellation?.reason && (
          <section className="space-y-2">
            <Label className="font-semibold text-xs uppercase text-destructive">
              Cancellation
            </Label>
            <div className="rounded-lg border divide-y text-sm">
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Reason</span>
                <span className="text-xs">
                  {viewOrder.cancellation.reason || "—"}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] p-3">
                <span className="font-semibold text-xs">Cancelled By</span>
                <span className="text-xs capitalize">
                  {viewOrder.cancellation.cancelledByRole || "—"}
                </span>
              </div>
            </div>
          </section>
        )}
      </ViewAdminDialog>
    </div>
  );
};

export default OrderManagement;
