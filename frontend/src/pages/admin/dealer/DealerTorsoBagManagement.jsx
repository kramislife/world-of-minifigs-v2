import React from "react";
import { formatDate, display } from "@/utils/formatting";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useDealerTorsoBagManagement from "@/hooks/admin/useDealerTorsoBagManagement";

const DealerTorsoBagManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    fileInputRef,
    page,
    limit,
    search,
    bags,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    targetBundleSizeOptions,
    adminTarget,
    miscQuantity,
    currentTotal,
    isLoadingBags,
    isSubmitting,
    isDeleting,
    handleDialogClose,
    setDeleteDialogOpen,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFileChange,
    handleUpdateItemQuantity,
    handleRemoveFile,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleChange,
    handleValueChange,
  } = useDealerTorsoBagManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Torso Bag Management"
        description="Configure torso design bags for dealer bundles"
        actionLabel="Add Bag"
        onAction={handleAdd}
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search bags..."
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
        data={bags}
        isLoading={isLoadingBags}
        renderRow={(bag) => (
          <>
            {/* Bag Name */}
            <TableCell maxWidth="200px" className="font-medium">
              {display(bag.bagName)}
            </TableCell>

            {/* Target Size */}
            <TableCell>{bag.targetBundleSize} Minifigs</TableCell>

            {/* Designs Count */}
            <TableCell>{bag.items?.length} Designs</TableCell>

            {/* Visibility */}
            <TableCell>
              <StatusBadge isActive={bag.isActive} />
            </TableCell>

            {/* Created At */}
            <TableCell>{formatDate(bag.createdAt)}</TableCell>

            {/* Updated At */}
            <TableCell>{formatDate(bag.updatedAt)}</TableCell>

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(bag)}
              onDelete={() => handleDelete(bag)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Torso Bag" : "Add Torso Bag"}
        description={
          dialogMode === "edit"
            ? "Update the bag name, target size, and designs."
            : "Create a new torso design bag."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={dialogMode === "edit" ? "Update Bag" : "Create Bag"}
        className="sm:max-w-4xl"
      >
        <div className="space-y-5">
          {/* Bag Name & Target Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="bagName">Bag Name</Label>
              <Input
                id="bagName"
                name="bagName"
                placeholder="Bag 1001"
                value={formData.bagName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="targetBundleSize">Target Size</Label>
              <Select
                value={formData.targetBundleSize.toString()}
                onValueChange={handleValueChange("targetBundleSize")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="targetBundleSize" className="w-full">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {targetBundleSizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Torso Designs Upload */}
          <div className="space-y-3">
            <Label>Torso Designs Attachment</Label>

            <div
              className={`grid gap-2 ${
                formData.items.length > 0
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="relative border rounded-md overflow-hidden flex flex-col group transition-all hover:border-primary/50"
                >
                  <div className="aspect-square relative border-b">
                    <img
                      src={item.url}
                      alt="Torso design"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="p-2 space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={item.quantity}
                      onChange={handleUpdateItemQuantity(index)}
                      className="h-9 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}

              {/* Upload Trigger */}
              <Label
                htmlFor="multi-upload"
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-32`}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-bold text-muted-foreground">
                  Click to upload
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  PNG, JPG, WEBP (Multiple)
                </p>
                <input
                  id="multi-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  ref={fileInputRef}
                />
              </Label>
            </div>
          </div>

          {/* Quantity Summary */}
          <div className="p-4 rounded-lg border flex">
            <div className="space-y-2 flex-1 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">{currentTotal}</span>
                <span className="opacity-50">/</span>
                <span className="font-bold">{adminTarget}</span>
                <span className="text-xs ml-1">designs configured</span>

                {currentTotal === adminTarget ? (
                  <Badge variant="success" className="ml-auto">
                    MATCHED
                  </Badge>
                ) : currentTotal > adminTarget ? (
                  <Badge variant="destructive" className="ml-auto">
                    {currentTotal - adminTarget} EXCEEDED
                  </Badge>
                ) : (
                  <Badge variant="warning" className="ml-auto">
                    {adminTarget - currentTotal} REMAINING
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                * Admin designs must total {adminTarget} + {miscQuantity}{" "}
                miscellaneous = {adminTarget + miscQuantity} minifigs.
              </p>
            </div>
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this bag will be hidden from dealer bundles"
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
        itemName={display(selectedItem?.bagName)}
        title="Delete Torso Bag"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerTorsoBagManagement;
