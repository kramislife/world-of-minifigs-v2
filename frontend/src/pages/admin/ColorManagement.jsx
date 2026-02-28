import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import { display } from "@/utils/formatting";
import useColorManagement from "@/hooks/admin/useColorManagement";

const ColorManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    colors,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingColors,
    isSubmitting,
    isDeleting,
    handleChange,
    handleColorPickerChange,
    handleValueChange,
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
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Color Management"
        description="Manage product colors in your store"
        actionLabel="Add Color"
        onAction={handleAdd}
      />

      {/* Table Layout */}
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
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
        columns={columns}
        data={colors}
        isLoading={isLoadingColors}
        renderRow={(color) => (
          <>
            {/* Color Name */}
            <TableCell maxWidth="200px">{display(color.colorName)}</TableCell>

            {/* Hex Code */}
            <TableCell>
              <div className="flex items-center justify-center gap-2">
                {color.hexCode && (
                  <div
                    className="size-5 rounded-md shrink-0 border"
                    style={{ backgroundColor: color.hexCode }}
                  />
                )}
                <span>{display(color.hexCode)}</span>
              </div>
            </TableCell>

            {/* Status */}
            <StatusCell isActive={color.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={color.createdAt}
              updatedAt={color.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(color)}
              onDelete={() => handleDelete(color)}
            />
          </>
        )}
      />

      {/* Add / Edit Color Dialog */}
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
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Color" : "Create Color"
        }
      >
        <div className="space-y-4">
          {/* Color Name */}
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
              disabled={isSubmitting}
            />
          </div>

          {/* Hex Code */}
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
                  disabled={isSubmitting}
                />
              </div>
              <Input
                type="color"
                value={getColorPickerValue()}
                onChange={handleColorPickerChange}
                disabled={isSubmitting}
                className="w-12 p-1 cursor-pointer"
                title="Pick a color"
              />
            </div>
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this color will not appear in product filters or public listings"
            checked={formData.isActive}
            onChange={handleValueChange("isActive")}
            disabled={isSubmitting}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={display(selectedItem?.colorName)}
        title="Delete Color"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ColorManagement;
