import React from "react";
import { X } from "lucide-react";
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
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
} from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import { formatCurrency, display } from "@/utils/formatting";
import useDealerBundleManagement from "@/hooks/admin/useDealerBundleManagement";

const DealerBundleManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    bundles,
    totalItems,
    totalPages,
    startItem,
    endItem,
    calculatedTotal,
    columns,
    isLoadingBundles,
    isSubmitting,
    isDeleting,
    handleChange,
    handleValueChange,
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handlePrevious,
    handleNext,
    setDeleteDialogOpen,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
  } = useDealerBundleManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Dealer Bundles"
        description="Manage bulk packs and pricing steps"
        actionLabel="Add Bundle"
        onAction={handleAdd}
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search bundles..."
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
        data={bundles}
        isLoading={isLoadingBundles}
        renderRow={(bundle) => (
          <>
            {/* Bundle Name */}
            <TableCell maxWidth="200px">{display(bundle.bundleName)}</TableCell>

            {/* Torso Type */}
            <TableCell className="capitalize">{bundle.torsoBagType}</TableCell>

            {/* Quantity */}
            <TableCell>{bundle.minifigQuantity}</TableCell>

            {/* Unit Price */}
            <TableCell>{formatCurrency(bundle.unitPrice)}</TableCell>

            {/* Total Price */}
            <TableCell className="font-bold text-success dark:text-accent">
              {formatCurrency(bundle.totalPrice)}
            </TableCell>

            {/* Status */}
            <TableCell>
              <StatusBadge isActive={bundle.isActive} />
            </TableCell>

            {/* Timestamps */}
            <TimestampCells
              createdAt={bundle.createdAt}
              updatedAt={bundle.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(bundle)}
              onDelete={() => handleDelete(bundle)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Bundle" : "Add Bundle"}
        description={
          dialogMode === "edit"
            ? "Update the dealer bundle details and pricing."
            : "Create a new bundle package for dealers."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Bundle" : "Create Bundle"
        }
        className="sm:max-w-2xl"
      >
        <div className="space-y-4">
          {/* Bundle Name */}
          <div className="space-y-2">
            <Label htmlFor="bundleName">Bundle Name</Label>
            <Input
              id="bundleName"
              name="bundleName"
              placeholder="100 Minifigs"
              value={formData.bundleName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Quantity / Price / Type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minifigQuantity">Quantity</Label>
              <Input
                id="minifigQuantity"
                name="minifigQuantity"
                type="number"
                placeholder="100"
                value={formData.minifigQuantity}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                step="0.01"
                placeholder="0.50"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="torsoBagType">Torso Bag Type</Label>
              <Select
                value={formData.torsoBagType}
                onValueChange={handleValueChange("torsoBagType")}
              >
                <SelectTrigger id="torsoBagType" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="custom">Custom Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              {formData.features.length < 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={addArrayItem("features")}
                >
                  Add Feature
                </Button>
              )}
            </div>

            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Textarea
                  value={feature}
                  onChange={handleArrayChange("features", index)}
                  placeholder="e.g. 100 minifigures"
                  rows={4}
                />

                {formData.features.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={removeArrayItem("features", index)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Calculated Total */}
          <div className="flex justify-between items-center text-sm font-semibold pt-3">
            <span>Calculated Total Cost:</span>
            <span className="text-lg text-success dark:text-accent">
              {formatCurrency(calculatedTotal)}
            </span>
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this bundle will be hidden from dealer pages"
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
        itemName={display(selectedItem?.bundleName)}
        title="Delete Bundle"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerBundleManagement;
