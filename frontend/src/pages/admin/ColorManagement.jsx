import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import {
  useCreateColorMutation,
  useUpdateColorMutation,
  useGetColorsQuery,
  useDeleteColorMutation,
} from "@/redux/api/adminApi";

const ColorManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [formData, setFormData] = useState({
    colorName: "",
    hexCode: "",
  });

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: colorsResponse, isLoading: isLoadingColors } = useGetColorsQuery({
    page,
    limit,
    search: search || undefined, // Only send if not empty
  });

  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  // Extract data from server response
  const colors = colorsResponse?.colors || [];
  const totalItems = colorsResponse?.pagination?.totalItems || 0;
  const totalPages = colorsResponse?.pagination?.totalPages || 1;

  // Column definitions
  const columns = [
    { key: "colorName", label: "Color Name" },
    { key: "hexCode", label: "Hex Code" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorPickerChange = (e) => {
    const colorValue = e.target.value; // This will be in #RRGGBB format
    setFormData((prev) => ({
      ...prev,
      hexCode: colorValue.toUpperCase(),
    }));
  };

  // Convert hexCode to format suitable for color picker (#RRGGBB)
  const getColorPickerValue = () => {
    if (!formData.hexCode.trim()) return "#000000";
    const hex = formData.hexCode.trim();
    // If it already starts with #, return it, otherwise add #
    return hex.startsWith("#") ? hex : `#${hex}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.colorName.trim()) {
      toast.error("Color name is required", {
        description: "Please enter a color name.",
      });
      return;
    }

    // Validate hex code (required)
    if (!formData.hexCode.trim()) {
      toast.error("Hex code is required", {
        description: "Please enter a hex color code.",
      });
      return;
    }

    // Validate hex code format
    const hexPattern = /^#?[0-9A-F]{6}$/i;
    if (!hexPattern.test(formData.hexCode.trim())) {
      toast.error("Invalid hex code format", {
        description:
          "Hex code must be in format #RRGGBB or RRGGBB (e.g., #FF5733 or FF5733).",
      });
      return;
    }

    try {
      const colorData = {
        colorName: formData.colorName.trim(),
        hexCode: formData.hexCode.trim(),
      };

      if (dialogMode === "edit" && selectedColor) {
        // Update existing color
        const colorId = selectedColor._id || selectedColor.id;
        const response = await updateColor({
          id: colorId,
          ...colorData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Color updated successfully", {
            description: `The color "${response.color.colorName}" has been updated.`,
          });

          // Reset form and close dialog
          setFormData({
            colorName: "",
            hexCode: "",
          });
          setSelectedColor(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        // Create new color
        const response = await createColor(colorData).unwrap();

        if (response.success) {
          toast.success(response.message || "Color created successfully", {
            description: `The color "${response.color.colorName}" has been added.`,
          });

          // Reset form and close dialog
          setFormData({
            colorName: "",
            hexCode: "",
          });
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} color error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${dialogMode === "edit" ? "update" : "create"} color`,
        {
          description:
            error?.data?.description ||
            "An unexpected error occurred. Please try again.",
        }
      );
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      // Reset form and mode when dialog closes
      setFormData({
        colorName: "",
        hexCode: "",
      });
      setSelectedColor(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedColor(null);
    setFormData({
      colorName: "",
      hexCode: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (color) => {
    setDialogMode("edit");
    setSelectedColor(color);
    setFormData({
      colorName: color.colorName || "",
      hexCode: color.hexCode || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (color) => {
    setSelectedColor(color);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedColor) return;

    try {
      const colorId = selectedColor._id || selectedColor.id;
      await deleteColor(colorId).unwrap();

      toast.success("Color deleted successfully", {
        description: `The color "${selectedColor.colorName}" has been removed.`,
      });

      setDeleteDialogOpen(false);
      setSelectedColor(null);
    } catch (error) {
      console.error("Delete color error:", error);
      toast.error(error?.data?.message || "Failed to delete color", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle pagination and search changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Color Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product colors in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Color
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search colors..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={colors}
        isLoading={isLoadingColors}
        loadingMessage="Loading colors..."
        emptyMessage="No color found..."
        renderRow={(color) => (
          <>
            <TableCell maxWidth="200px">{color.colorName}</TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-2">
                {color.hexCode && (
                  <div
                    className="size-5 rounded-md shrink-0"
                    style={{ backgroundColor: color.hexCode }}
                  />
                )}
                <span>{color.hexCode || "-"}</span>
              </div>
            </TableCell>
            <TableCell>
              {color.createdAt
                ? new Date(color.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {color.updatedAt
                ? new Date(color.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(color)}
              onDelete={() => handleDelete(color)}
            />
          </>
        )}
      />

      {/* Add/Edit Color Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Color" : "Add New Color"}
        description={
          dialogMode === "edit"
            ? "Update the color details."
            : "Create a new color for your products."
        }
        onSubmit={handleSubmit}
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit" ? "Update Color" : "Create Color"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="colorName">Color Name</Label>
          <Input
            id="colorName"
            name="colorName"
            type="text"
            placeholder="e.g., Red, Blue, Forest Green"
            value={formData.colorName}
            onChange={handleChange}
            required
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hexCode">Hex Code</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                id="hexCode"
                name="hexCode"
                type="text"
                placeholder="#000000"
                value={formData.hexCode}
                onChange={handleChange}
                required
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
              />
            </div>
            <Input
              type="color"
              value={getColorPickerValue()}
              onChange={handleColorPickerChange}
              disabled={dialogMode === "edit" ? isUpdating : isCreating}
              className="w-12 p-1 cursor-pointer"
              title="Pick a color"
            />
          </div>
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedColor?.colorName || ""}
        title="Delete Color"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ColorManagement;
