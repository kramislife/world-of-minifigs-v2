import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import { formatDate, formatCurrency, display } from "@/utils/formatting";
import useRewardBundleManagement from "@/hooks/admin/useRewardBundleManagement";

const RewardBundleManagement = () => {
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
  } = useRewardBundleManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Reward Bundles"
        description="Manage packs for the Reward Program"
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

            {/* Quantity */}
            <TableCell className="font-semibold">
              {bundle.minifigQuantity}
            </TableCell>

            {/* Total Price */}
            <TableCell className="font-semibold text-success">
              {formatCurrency(bundle.totalPrice)}
            </TableCell>

            {/* Status */}
            <TableCell>
              <StatusBadge isActive={bundle.isActive} />
            </TableCell>

            {/* Created At */}
            <TableCell>{formatDate(bundle.createdAt)}</TableCell>

            {/* Updated At */}
            <TableCell>{formatDate(bundle.updatedAt)}</TableCell>

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
        title={
          dialogMode === "edit" ? "Edit Reward Bundle" : "Add Reward Bundle"
        }
        description={
          dialogMode === "edit"
            ? "Update the reward program bundle details."
            : "Create a new bundle package for the Reward Program."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Bundle" : "Create Bundle"
        }
      >
        <div className="space-y-4">
          {/* Bundle Name */}
          <div className="space-y-2">
            <Label htmlFor="bundleName">Bundle Name</Label>
            <Input
              id="bundleName"
              name="bundleName"
              placeholder="e.g., Starter Pack"
              value={formData.bundleName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minifigQuantity">Quantity</Label>
              <Input
                id="minifigQuantity"
                name="minifigQuantity"
                type="number"
                placeholder="e.g., 20"
                value={formData.minifigQuantity}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">Price</Label>
              <Input
                id="totalPrice"
                name="totalPrice"
                type="number"
                step="0.01"
                placeholder="e.g., 50.00"
                value={formData.totalPrice}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>

              {formData.features.length < 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={addArrayItem("features")}
                  disabled={isSubmitting}
                >
                  Add Feature
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Textarea
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={handleArrayChange("features", index)}
                    rows={2}
                    className="flex-1"
                    disabled={isSubmitting}
                  />

                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive h-10 w-10"
                      onClick={removeArrayItem("features", index)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this reward bundle will be hidden from public listings"
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
        title="Delete Reward Bundle"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RewardBundleManagement;
