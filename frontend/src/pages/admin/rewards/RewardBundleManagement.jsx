import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import {
  AdminFormInput,
  AdminFormTextarea,
} from "@/components/shared/AdminFormInput";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
  PriceCell,
} from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import { display } from "@/utils/formatting";
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
            <PriceCell amount={bundle.totalPrice} />

            {/* Status */}
            <StatusCell isActive={bundle.isActive} />

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
        entityName="Reward Bundle"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {/* Bundle Name */}
          <AdminFormInput
            label="Bundle Name"
            name="bundleName"
            placeholder="Starter Pack"
            value={formData.bundleName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            {/* Quantity */}
            <AdminFormInput
              label="Quantity"
              name="minifigQuantity"
              type="number"
              placeholder="100"
              value={formData.minifigQuantity}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            {/* Price */}
            <AdminFormInput
              label="Price"
              name="totalPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.totalPrice}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="feature-0">Features</Label>

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
                  <AdminFormTextarea
                    name={`feature-${index}`}
                    placeholder="Enter bundle features..."
                    value={feature}
                    onChange={handleArrayChange("features", index)}
                    disabled={isSubmitting}
                    className="flex-1"
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
        itemName={display(selectedItem?.bundleName)}
        title="Delete Reward Bundle"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RewardBundleManagement;
