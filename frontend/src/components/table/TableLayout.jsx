import React from "react";
import SearchBar from "@/components/table/SearchBar";
import ShowEntries from "@/components/table/ShowEntries";
import Pagination from "@/components/table/Pagination";
import { TableHeader } from "@/components/table/BaseColumn";
import useTableLayout from "@/hooks/useTableLayout";

const TableLayout = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  entriesValue,
  onEntriesChange,
  page,
  onPageChange,
  totalItems,
  totalPages,
  columns = [],
  data = [],
  renderRow,
  isLoading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No items found...",
}) => {
  const {
    search,
    limit,
    startItem,
    endItem,
    handleSearchChange,
    handleLimitChange,
    handlePrevious,
    handleNext,
  } = useTableLayout({
    page,
    onPageChange,
    limit: entriesValue,
    onLimitChange: onEntriesChange,
    search: searchValue,
    onSearchChange,
    totalItems,
  });

  return (
    <div className="space-y-5 pt-5">
      {/* Table Controls - Top */}
      <div className="flex items-center justify-between">
        <ShowEntries
          value={limit}
          onValueChange={handleLimitChange}
        />
        <SearchBar
          placeholder={searchPlaceholder}
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-input dark:bg-card/30">
            <tr>
              {columns.map((column) => (
                <TableHeader key={column.key}>{column.label}</TableHeader>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-5 text-center text-popover-foreground/80"
                >
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item._id || item.id} className="border-t text-sm">
                  {renderRow(item)}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-5 text-center text-popover-foreground/80"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Controls - Bottom */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        onPrevious={() => handlePrevious()}
        onNext={() => handleNext(totalPages)}
      />
    </div>
  );
};

export default TableLayout;
