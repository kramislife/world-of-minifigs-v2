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
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import { formatCurrency, display } from "@/utils/formatting";
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
            <TableCell className="text-success dark:text-accent font-bold">
              {formatCurrency(addon.price)}
            </TableCell>

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
        title={
          dialogMode === "edit" ? "Edit Reward Add-on" : "Add Reward Add-on"
        }
        description={
          dialogMode === "edit"
            ? "Update the reward program add-on details."
            : "Create a new optional add-on for the Reward Program."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Add-on" : "Create Add-on"
        }
      >
        <div className="space-y-4">
          {/* Duration, Quantity, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={handleValueChange("duration")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="duration" className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                placeholder="e.g., 20"
                value={formData.quantity}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price monthly</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="e.g., 50.00"
                value={formData.price}
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
                  <Textarea
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={handleArrayChange("features", index)}
                    rows={2}
                    className="flex-1"
                    disabled={isSubmitting}
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
