import React from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to extract text content from React children
const getTextContent = (children) => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("").trim();
  }
  if (React.isValidElement(children)) {
    if (children.props?.children) {
      return getTextContent(children.props.children);
    }
    // If element has no children, try to get text from props (e.g., value, label)
    return (
      children.props?.value ||
      children.props?.label ||
      children.props?.title ||
      ""
    );
  }
  return "";
};

// Helper function to render table header
export const TableHeader = ({ children }) => {
  return (
    <th className="px-4 py-3 text-center text-sm font-semibold">{children}</th>
  );
};

// Helper function to render table cell with standard styling
export const TableCell = ({
  children,
  className = "",
  maxWidth,
  truncate = true,
}) => {
  const textContent = getTextContent(children);
  const titleText = textContent || undefined;

  return (
    <td className={`px-4 py-3 text-center text-sm ${className}`}>
      {truncate ? (
        <div
          className="truncate"
          style={maxWidth ? { maxWidth, margin: "0 auto" } : {}}
          title={titleText}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </td>
  );
};

// Actions Column Component
export const ActionsColumn = ({
  onView,
  onEdit,
  onDelete,
  viewTitle = "View",
  editTitle = "Update",
  deleteTitle = "Delete",
}) => {
  return (
    <td className="px-4 py-3 flex items-center justify-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="More actions"
            className="mx-auto border-none shadow-none hover:bg-transparent focus:ring-0 focus:bg-transparent"
          >
            <Ellipsis className="size-5" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onView && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onView();
              }}
            >
              {viewTitle}
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onEdit();
              }}
            >
              {editTitle}
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                onDelete();
              }}
            >
              {deleteTitle}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  );
};
