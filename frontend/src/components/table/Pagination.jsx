import React from "react";
import { Button } from "@/components/ui/button";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  startItem = 0,
  endItem = 0,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
