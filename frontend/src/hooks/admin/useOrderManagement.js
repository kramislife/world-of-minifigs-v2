import { useState } from "react";
import { useGetOrdersQuery } from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";

const useOrderManagement = () => {
  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data
  const { data: ordersResponse, isLoading: isLoadingOrders } =
    useGetOrdersQuery({
      page,
      limit,
      search: search || undefined,
    });

  const {
    items: orders,
    totalItems,
    totalPages,
  } = extractPaginatedData(ordersResponse, "orders");

  const columns = [
    { key: "invoice", label: "Invoice Number" },
    { key: "recipient", label: "Recipient" },
    { key: "email", label: "Email" },
    { key: "orderType", label: "Order Type" },
    { key: "items", label: "Items" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
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
    // Handlers
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  };
};

export default useOrderManagement;
