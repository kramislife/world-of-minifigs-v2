import React from "react";
import { formatDate } from "@/utils/formatting";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

    // Handlers
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
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
  } = useDealerTorsoBagManagement();

  return (
    <div className="space-y-5">
      {/* Header */}
      <AdminManagementHeader
        title="Torso Bag Management"
        description="Configure torso design bags for dealer bundles"
        actionLabel="Add Bag"
        onAction={handleAdd}
      />

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
            <TableCell maxWidth="200px" className="font-medium">
              {bag.bagName}
            </TableCell>

            <TableCell>
              <Badge variant="outline">{bag.targetBundleSize} Minifigs</Badge>
            </TableCell>

            <TableCell>
              <Badge variant="secondary">
                {bag.items?.length || 0} Designs
              </Badge>
            </TableCell>

            <TableCell>
              <Badge variant={bag.isActive ? "success" : "destructive"}>
                {bag.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>

            <TableCell>
              {bag.createdAt ? formatDate(bag.createdAt) : "-"}
            </TableCell>

            <TableCell>
              {bag.updatedAt ? formatDate(bag.updatedAt) : "-"}
            </TableCell>

            <ActionsColumn
              onEdit={() => handleEdit(bag)}
              onDelete={() => handleDelete(bag)}
            />
          </>
        )}
      />

      {/* Add/Edit Bag Dialog */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="bagName">Bag Name</Label>
              <Input
                id="bagName"
                name="bagName"
                placeholder="Bag 1001"
                value={formData.bagName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, bagName: e.target.value }))
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="target">Target Size</Label>
              <Select
                value={formData.targetBundleSize.toString()}
                onValueChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    targetBundleSize: Number(v),
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="target" className="w-full">
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

          {/* Torso Designs Section */}
          <div className="space-y-3">
            <Label>Torso Designs Attachment</Label>
            <div
              className={`grid gap-4 ${
                formData.items.length > 0
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="relative group border rounded-lg overflow-hidden"
                >
                  <div className="aspect-square relative border-b">
                    <img
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  {/* Quantity Input */}
                  <div className="p-3 space-y-2">
                    <Label className="text-xs font-semibold">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItemQuantity(index, e.target.value)
                      }
                      className="h-8 text-xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}

              <Label
                htmlFor="multi-upload"
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center justify-center min-h-[150px]"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Upload Image
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP (5MB max)
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

          {/* Quantity Status Summary */}
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

          {/* Status Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="bagActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: !!checked }))
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="bagActive">Available to Dealers</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedItem?.bagName || ""}
        title="Delete Torso Bag"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerTorsoBagManagement;
