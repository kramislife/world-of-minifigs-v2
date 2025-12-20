import { useState, useMemo, useEffect } from "react";

const useTableLayout = ({
  // Search props
  searchValue: externalSearchValue,
  onSearchChange,

  // Entries props
  entriesValue: externalEntriesValue,
  onEntriesChange,

  // Pagination props
  totalItems: externalTotalItems,

  // Table props
  data = [],
  searchFields = [],
}) => {
  // Internal state management
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalEntriesValue, setInternalEntriesValue] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  // Use external values if provided, otherwise use internal state
  const searchValue =
    externalSearchValue !== undefined
      ? externalSearchValue
      : internalSearchValue;
  const entriesValue =
    externalEntriesValue !== undefined
      ? externalEntriesValue
      : internalEntriesValue;

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchValue.trim() || searchFields.length === 0) {
      return data;
    }

    const searchLower = searchValue.toLowerCase().trim();
    return data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field];
        if (fieldValue === null || fieldValue === undefined) return false;
        return String(fieldValue).toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchValue, searchFields]);

  // Calculate total items (use filtered data count if data is provided, otherwise use external totalItems)
  const totalItems =
    externalTotalItems !== undefined && data.length === 0
      ? externalTotalItems
      : filteredData.length;

  // Calculate pagination values
  const entriesPerPage =
    entriesValue === "all" ? totalItems : parseInt(entriesValue, 10);
  const totalPages =
    entriesValue === "all" || entriesPerPage === 0
      ? 1
      : Math.ceil(totalItems / entriesPerPage);

  // Slice data based on current page and entries per page
  const paginatedData = useMemo(() => {
    if (entriesValue === "all" || entriesPerPage === 0) {
      return filteredData;
    }
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, entriesPerPage, entriesValue]);

  // Calculate pagination display values
  const startItem =
    totalItems === 0
      ? 0
      : entriesValue === "all"
      ? 1
      : (currentPage - 1) * entriesPerPage + 1;
  const endItem =
    entriesValue === "all"
      ? totalItems
      : Math.min(currentPage * entriesPerPage, totalItems);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Handle pagination navigation
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(e);
    } else {
      setInternalSearchValue(value);
    }
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle entries change
  const handleEntriesChange = (value) => {
    if (onEntriesChange) {
      onEntriesChange(value);
    } else {
      setInternalEntriesValue(value);
    }
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  return {
    // State values
    searchValue,
    entriesValue,
    currentPage,
    
    // Calculated values
    filteredData,
    paginatedData,
    totalItems,
    entriesPerPage,
    totalPages,
    startItem,
    endItem,
    
    // Handlers
    handleSearchChange,
    handleEntriesChange,
    handlePrevious,
    handleNext,
  };
};

export default useTableLayout;
