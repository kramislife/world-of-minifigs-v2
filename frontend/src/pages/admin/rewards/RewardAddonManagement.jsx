import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
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
import {
  AdminFormInput,
  AdminFormTextarea,
  AdminFormSelect,
} from "@/components/shared/AdminFormInput";
import useRewardAddonManagement from "@/hooks/admin/useRewardAddonManagement";

const RewardAddonManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    addons,
    totalItems,
    totalPages,
    startItem,
    endItem,
    columns,
    isLoadingAddons,
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
  } = useRewardAddonManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Reward Add-ons"
        description="Manage optional items for the Reward Program"
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
            {/* Duration */}
            <TableCell>{display(addon.duration)} months</TableCell>

            {/* Quantity */}
            <TableCell>{display(addon.quantity)} Minifigs</TableCell>

            {/* Price */}
            <PriceCell amount={addon.price} />

            {/* Status */}
            <StatusCell isActive={addon.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={addon.createdAt}
              updatedAt={addon.updatedAt}
            />

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
        entityName="Reward Add-on"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {/* Duration, Quantity, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <AdminFormSelect
              label="Duration"
              name="duration"
              value={formData.duration}
              onValueChange={handleValueChange("duration")}
              disabled={isSubmitting}
              options={[
                { value: "3", label: "3 months" },
                { value: "6", label: "6 months" },
                { value: "12", label: "12 months" },
              ]}
              placeholder="Select duration"
            />

            {/* Quantity */}
            <AdminFormInput
              label="Quantity"
              name="quantity"
              type="number"
              placeholder="100"
              value={formData.quantity}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />

            {/* Price monthly */}
            <AdminFormInput
              label="Price monthly"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Description */}
          <AdminFormTextarea
            label="Description"
            name="description"
            placeholder="Enter addon description..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>

              {formData.features?.length < 5 && (
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
              {(formData.features || [""]).map((feature, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <AdminFormTextarea
                    name={`feature-${index}`}
                    placeholder="Enter addon features..."
                    value={feature}
                    onChange={handleArrayChange("features", index)}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  {(formData.features?.length || 1) > 1 && (
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
        itemName={
          selectedItem
            ? `${display(selectedItem.quantity)} Minifigs for ${display(
                selectedItem.duration,
              )} Months`
            : ""
        }
        title="Delete Reward Add-on"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RewardAddonManagement;
