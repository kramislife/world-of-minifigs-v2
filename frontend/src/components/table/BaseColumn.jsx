import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
