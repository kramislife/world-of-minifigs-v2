import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import { formatDate, formatCurrency, display } from "@/utils/formatting";
import useDealerAddonManagement from "@/hooks/admin/useDealerAddonManagement";

const DealerAddonManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    filePreview,
    page,
    limit,
    search,
    addons,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingAddons,
    isLoadingColors,
    isSubmitting,
    isDeleting,
    colors,
    handleChange,
    handleValueChange,
    handleDealerAddonFileChange,
    handleDealerAddonFileRemove,
    handleUpdateFileMetadata,
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
  } = useDealerAddonManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Dealer Add-on Management"
        description="Manage dealer add-ons and premium bundle items"
        actionLabel="Add Add-on"
        onAction={handleAdd}
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search add-ons..."
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
        data={addons}
        isLoading={isLoadingAddons}
        renderRow={(addon) => (
          <>
            {/* Add-on Name */}
            <TableCell maxWidth="200px">{display(addon.addonName)}</TableCell>

            {/* Description */}
            <TableCell maxWidth="300px">{display(addon.description)}</TableCell>

            {/* Price */}
            <TableCell className="text-success dark:text-accent font-bold">
              {Number(addon.price) > 0
                ? `$${formatCurrency(addon.price)}`
                : "Free"}
            </TableCell>

            {/* Status */}
            <TableCell>
              <StatusBadge isActive={addon.isActive} />
            </TableCell>

            {/* Created At */}
            <TableCell>{formatDate(addon.createdAt)}</TableCell>

            {/* Updated At */}
            <TableCell>{formatDate(addon.updatedAt)}</TableCell>

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(addon)}
              onDelete={() => handleDelete(addon)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Add-on" : "Add Add-on"}
        description={
          dialogMode === "edit"
            ? "Update the add-on details."
            : "Create a new add-on for dealer bundles."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Add-on" : "Create Add-on"
        }
        className="sm:max-w-5xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Add-on Name */}
            <div className="space-y-2">
              <Label htmlFor="addonName">Add-on Name</Label>
              <Input
                id="addonName"
                name="addonName"
                placeholder="e.g. Premium Chrome Pack"
                value={formData.addonName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Base Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="20.00"
                value={formData.price}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter add-on description..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          {/* Image Attachments */}
          <MediaUpload
            label="Image Attachments"
            multiple
            previews={filePreview}
            onChange={handleDealerAddonFileChange}
            onRemove={handleDealerAddonFileRemove}
            accept="image/*"
            description="PNG, JPG, WEBP (Multiple)"
            previewClassName="aspect-square"
            disabled={isSubmitting}
            renderItem={(item, index) => (
              <div className="p-2 space-y-2">
                <Input
                  placeholder="Item Name"
                  value={item.itemName}
                  onChange={handleUpdateFileMetadata(index, "itemName")}
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-2 gap-1">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.itemPrice}
                    onChange={handleUpdateFileMetadata(index, "itemPrice")}
                    className="h-9 text-xs"
                  />
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
              </div>
            )}
          />

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this add-on will not appear in dealer bundles"
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
        itemName={display(selectedItem?.addonName)}
        title="Delete Add-on"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerAddonManagement;
