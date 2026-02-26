import React from "react";

/**
 * Helper function to extract text content from React children
 * Useful for setting title/tooltip attributes on truncated elements
 */
export const getTextContent = (children) => {
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
