const useTableLayout = ({
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
  totalItems = 0,
}) => {
  // Calculated display values for pagination UI
  const entriesPerPage =
    limit === "all" ? totalItems : parseInt(limit, 10) || 10;
  const startItem = totalItems === 0 ? 0 : (page - 1) * entriesPerPage + 1;
  const endItem = Math.min(page * entriesPerPage, totalItems);

  // Delegate to external handlers (from useAdminCrud / management hooks)
  const handlePageChange = (newPage) => onPageChange(newPage);

  const handleLimitChange = (value) => {
    onLimitChange(value);
    onPageChange(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    onPageChange(1);
  };

  const handlePrevious = () => {
    if (page > 1) handlePageChange(page - 1);
  };

  const handleNext = (maxPage) => {
    if (maxPage && page < maxPage) handlePageChange(page + 1);
  };

  return {
    limit,
    search,
    startItem,
    endItem,
    handleLimitChange,
    handleSearchChange,
    handlePrevious,
    handleNext,
  };
};

export default useTableLayout;
