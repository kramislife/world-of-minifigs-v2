import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductPagination = ({
  currentPage,
  totalPages,
  pageNumbers,
  isFirstPage,
  isLastPage,
  onPreviousPage,
  onNextPage,
  onPageNumberClick,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Button
        variant="link"
        size="sm"
        className="text-foreground hover:text-primary dark:text-accent"
        onClick={onPreviousPage}
        disabled={isFirstPage}
      >
        <ArrowLeft className="size-4" />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant="link"
              size="sm"
              className={`hover:text-primary dark:hover:text-accent transition-all ${
                currentPage === page
                  ? "text-primary dark:text-accent underline underline-offset-4 font-bold"
                  : "text-foreground dark:text-foreground"
              }`}
              onClick={() => onPageNumberClick(page)}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="link"
        size="sm"
        className="text-foreground hover:text-primary dark:text-accent"
        onClick={onNextPage}
        disabled={isLastPage}
      >
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
};

export default ProductPagination;
