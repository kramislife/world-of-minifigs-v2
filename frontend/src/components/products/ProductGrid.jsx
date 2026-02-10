import React from "react";
import { Label } from "@/components/ui/label";
import ErrorState from "@/components/shared/ErrorState";
import ProductCard from "./ProductCard";
import ProductPagination from "./ProductPagination";
import ProductSort from "./ProductSort";

const ProductGrid = ({
  products,
  sortBy,
  totalItems,
  page,
  totalPages,
  pageNumbers,
  hasProducts,
  showPagination,
  isFirstPage,
  isLastPage,
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
          Showing {products.length} of {totalItems} products
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
      {hasProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <ErrorState
          title="No products found"
          description="Try adjusting your filters to see more results."
        />
      )}

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
