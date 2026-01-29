import React from "react";
import { Label } from "@/components/ui/label";
import ProductCard from "./ProductCard";
import ProductPagination from "./ProductPagination";
import ProductSort from "./ProductSort";

const ProductGrid = ({
  products,
  sortBy,
  startItem,
  totalItems,
  page,
  totalPages,
  pageNumbers,
  hasProducts,
  showPagination,
  showEmptyState,
  isFirstPage,
  isLastPage,
  isLoading,
  onSortChange,
  onPreviousPage,
  onNextPage,
  onPageNumberClick,
  hideProductCountOnMobile = false,
  hideSortOnMobile = false,
}) => {
  return (
    <div className="flex flex-col space-y-5">
      {/* Top Bar: Product Count & Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <Label className={hideProductCountOnMobile ? "hidden lg:block" : ""}>
          Showing {isLoading ? 0 : startItem} of {isLoading ? 0 : totalItems}{" "}
          products
        </Label>
        <div
          className={
            hideSortOnMobile ? "hidden lg:flex" : "flex items-center gap-2"
          }
        >
          <ProductSort
            sortBy={sortBy}
            onSortChange={onSortChange}
            id="sort-select"
          />
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      ) : hasProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : showEmptyState ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No products found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {showPagination && (
        <ProductPagination
          currentPage={page}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onPageNumberClick={onPageNumberClick}
        />
      )}
    </div>
  );
};

export default ProductGrid;
