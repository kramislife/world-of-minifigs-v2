import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to render table header
export const TableHeader = ({ children }) => {
  return (
    <th className="px-4 py-3 text-center text-sm font-semibold">{children}</th>
  );
};

// Helper function to render table cell with standard styling
export const TableCell = ({ children }) => {
  return <td className="px-4 py-3 text-center text-sm">{children}</td>;
};

// Actions Column Component
export const ActionsColumn = ({
  onEdit,
  onDelete,
  editTitle = "Edit",
  deleteTitle = "Delete",
}) => {
  return (
    <td className="px-4 py-3">
      <div className="flex items-center justify-center gap-2">
        {onEdit && (
          <Button size="icon" title={editTitle} onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            title={deleteTitle}
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </td>
  );
};
