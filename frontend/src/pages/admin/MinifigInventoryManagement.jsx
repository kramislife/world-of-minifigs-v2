import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  StatusCell,
  PriceCell,
  TimestampCells,
} from "@/components/table/BaseColumn";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import { display } from "@/utils/formatting";
import useMinifigInventoryManagement from "@/hooks/admin/useMinifigInventoryManagement";

const MinifigInventoryManagement = () => {
  const {
    inventory,
    colors,
    isLoadingInventory,
    isLoadingColors,
    isSubmitting,
    isDeleting,
    filePreview,
    handleInventoryFileChange,
    handleInventoryFileRemove,
    handleUpdateFileMetadata,
    dialogOpen,
    dialogMode,
    formData,
    handleDialogClose,
    handleEdit,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedItem,
    page,
    limit,
    search,
    totalItems,
    totalPages,
    startItem,
    endItem,
    columns,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handlePrevious,
    handleNext,
    handleAdd,
    handleValueChange,
  } = useMinifigInventoryManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Minifig Inventory"
        description="Manage your minifig stock and bulk upload new items"
        actionLabel="Add Inventory"
        onAction={handleAdd}
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search by name..."
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
        data={inventory}
        isLoading={isLoadingInventory}
        renderRow={(item) => (
          <>
            {/* Minifig Name */}
            <TableCell>{display(item.minifigName)}</TableCell>

            {/* Color */}
            <TableCell>
              <div className="flex items-center justify-center gap-2">
                {item.colorId?.hexCode && (
                  <div
                    className="size-5 rounded-md shrink-0 border"
                    style={{ backgroundColor: item.colorId?.hexCode }}
                  />
                )}
                <span>{display(item.colorId?.colorName)}</span>
              </div>
            </TableCell>

            {/* Price */}
            <PriceCell amount={item.price} />

            {/* Stock */}
            <TableCell>{item.stock}</TableCell>

            {/* Status */}
            <StatusCell isActive={item.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={item.createdAt}
              updatedAt={item.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          </>
        )}
      />

      {/* Add / Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Inventory" : "Add Inventory"}
        description={
          dialogMode === "edit"
            ? "Update minifig details."
            : "Drop multiple images to bulk create minifig items."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Inventory" : "Create Inventory"
        }
        className={dialogMode === "edit" ? "" : "sm:max-w-5xl"}
      >
        <div className="space-y-4">
          {/* Media Upload with Metadata Inputs */}
          <MediaUpload
            label="Minifig Inventory Image"
            multiple={dialogMode === "add"}
            previews={filePreview}
            preview={filePreview[0]?.url}
            onChange={handleInventoryFileChange}
            onRemove={handleInventoryFileRemove}
            accept="image/*"
            description="PNG, JPG, WEBP"
            previewClassName="aspect-square"
            disabled={isSubmitting}
            renderItem={(item, index) => (
              <div className="p-2 space-y-2">
                <Input
                  placeholder="Minifig Name"
                  value={item.minifigName}
                  onChange={handleUpdateFileMetadata(index, "minifigName")}
                  className="h-8 text-xs"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    value={item.price}
                    onChange={handleUpdateFileMetadata(index, "price")}
                    className="h-8 text-xs"
                  />

                  <Input
                    type="number"
                    placeholder="Stock"
                    value={item.stock}
                    onChange={handleUpdateFileMetadata(index, "stock")}
                    className="h-8 text-xs"
                  />
                </div>

                <Select
                  value={item.color}
                  onValueChange={handleUpdateFileMetadata(index, "color")}
                  disabled={isSubmitting || isLoadingColors}
                >
                  <SelectTrigger id="color" className="h-8 text-[11px] w-full">
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color._id} value={color._id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-3 rounded-full shrink-0 border"
                            style={{
                              backgroundColor: color.hexCode || "#000",
                            }}
                          />
                          <span>{color.colorName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          {/* Visibility */}
          <VisibilitySwitch
            checked={formData.isActive}
            onChange={handleValueChange("isActive")}
            disabled={isSubmitting}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={display(selectedItem?.minifigName)}
        title="Delete Inventory"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MinifigInventoryManagement;
