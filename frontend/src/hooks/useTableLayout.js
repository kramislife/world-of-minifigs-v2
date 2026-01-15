import { useState } from "react";

const useTableLayout = ({
  page: externalPage,
  onPageChange,

  limit: externalLimit,
  onLimitChange,

  search: externalSearch,
  onSearchChange,

  // Pagination info from server
  totalItems = 0,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const [internalLimit, setInternalLimit] = useState("10");
  const [internalSearch, setInternalSearch] = useState("");

  const page = externalPage !== undefined ? externalPage : internalPage;
  const limit = externalLimit !== undefined ? externalLimit : internalLimit;
  const search = externalSearch !== undefined ? externalSearch : internalSearch;

  // Calculate display values for pagination UI
  const entriesPerPage =
    limit === "all" ? totalItems : parseInt(limit, 10) || 10;
  const startItem = totalItems === 0 ? 0 : (page - 1) * entriesPerPage + 1;
  const endItem = Math.min(page * entriesPerPage, totalItems);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  // Handle limit change
  const handleLimitChange = (value) => {
    if (onLimitChange) {
      onLimitChange(value);
    } else {
      setInternalLimit(value);
    }
    // Reset to page 1 when changing limit
    handlePageChange(1);
  };

  // Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
    // Reset to page 1 when searching
    handlePageChange(1);
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (page > 1) {
      handlePageChange(page - 1);
    }
  };

  const handleNext = (maxPage) => {
    if (maxPage && page < maxPage) {
      handlePageChange(page + 1);
    }
  };

  return {
    // State values
    limit,
    search,

    // Calculated display values
    startItem,
    endItem,

    // Handlers
    handleLimitChange,
    handleSearchChange,
    handlePrevious,
    handleNext,
  };
};

export default useTableLayout;
