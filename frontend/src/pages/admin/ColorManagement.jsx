import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useColorManagement from "@/hooks/admin/useColorManagement";

const ColorManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedColor,
    dialogMode,
    formData,
    page,
    limit,
    search,
    colors,
    totalItems,
    totalPages,
    columns,
    isLoadingColors,
    isCreating,
    isUpdating,
    isDeleting,
    handleChange,
    handleColorPickerChange,
    getColorPickerValue,
    handleSubmit,
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    setDeleteDialogOpen,
  } = useColorManagement();

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
