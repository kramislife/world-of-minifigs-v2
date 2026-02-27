import React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    filePreviews,
    fileInputRef,
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
    isSubmitting,
    isDeleting,
    colors,
    handleChange,
    handleValueChange,
    handleFileChange,
    handleUpdateFileMetadata,
    handleRemoveFile,
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
          <div className="space-y-3">
            <Label>Image Attachments</Label>

            <div
              className={`grid gap-2 ${
                filePreviews.length > 0
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {filePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative border rounded-md overflow-hidden"
                >
                  <div className="aspect-square border-b">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="p-2 space-y-3 flex-1 overflow-visible">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Item Details
                      </Label>
                      <Input
                        placeholder="Item Name"
                        value={preview.itemName}
                        onChange={handleUpdateFileMetadata(index, "itemName")}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1 overflow-visible">
                      <div className="space-2">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={preview.itemPrice}
                          onChange={handleUpdateFileMetadata(
                            index,
                            "itemPrice",
                          )}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-2 overflow-visible">
                        <Select
                          value={preview.color || ""}
                          onValueChange={handleUpdateFileMetadata(
                            index,
                            "color",
                          )}
                        >
                          <SelectTrigger className="h-8 text-[11px] px-2 w-full">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent className="z-100">
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
                  </div>
                </div>
              ))}

              {/* Upload Button */}
              <Label
                htmlFor="addon-images"
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-32`}
              >
                <Upload className="size-8 text-muted-foreground mb-2" />
                <p className="text-sm font-bold text-muted-foreground">
                  Click to upload
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  PNG, JPG, WEBP (Multiple)
                </p>

                <Input
                  ref={fileInputRef}
                  id="addon-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </Label>
            </div>
          </div>

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
