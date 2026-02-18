import React from "react";
import TableLayout from "@/components/table/TableLayout";
import { TableCell } from "@/components/table/BaseColumn";
import useOrderManagement from "@/hooks/admin/useOrderManagement";

const OrderManagement = () => {
  const {
    page,
    limit,
    search,
    orders,
    totalItems,
    totalPages,
    columns,
    isLoadingOrders,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useOrderManagement();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            View and manage all orders placed by users
          </p>
        </div>
      </div>

      <TableLayout
        searchPlaceholder="Search order..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={orders}
        isLoading={isLoadingOrders}
        renderRow={(order) => (
          <>
            <TableCell maxWidth="140px" className="font-mono text-xs">
              {order.stripeInvoiceNumber || order._id?.substring(0, 7) || "-"}
            </TableCell>
            <TableCell maxWidth="180px">
              {order.userId
                ? `${order.userId.firstName} ${order.userId.lastName}`
                : "-"}
            </TableCell>
            <TableCell maxWidth="220px">{order.email}</TableCell>
            <TableCell maxWidth="180px">
              {order.shippingAddress?.name || "-"}
            </TableCell>
            <TableCell className="capitalize">
              {order.orderType || "-"}
            </TableCell>
            <TableCell>{order.items?.length || 0}</TableCell>
            <TableCell>
              {order.totalAmount ? (
                <span className="font-semibold">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell className="capitalize">
              {order.status || "unknown"}
            </TableCell>
            <TableCell>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "-"}
            </TableCell>
          </>
        )}
      />
    </div>
  );
};

export default OrderManagement;
