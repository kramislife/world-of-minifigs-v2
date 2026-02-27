import React from "react";
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
import { formatDate, formatCurrency, display } from "@/utils/formatting";
import useDealerExtraBagManagement from "@/hooks/admin/useDealerExtraBagManagement";

const DealerExtraBagManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    subCollections,
    extraBags,
    totalItems,
    totalPages,
    page,
    limit,
    search,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingExtraBags,
    isSubmitting,
    isDeleting,
    handleDialogClose,
    setDeleteDialogOpen,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleChange,
    handleValueChange,
  } = useDealerExtraBagManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Extra Part Bags"
        description="Configure pricing for additional part bags in Step 3"
        actionLabel="Set Bag Price"
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
        data={extraBags}
        isLoading={isLoadingExtraBags}
        renderRow={(bag) => (
          <>
            {/* Part Type */}
            <TableCell maxWidth="200px">
              {display(bag.subCollectionId?.subCollectionName)}
            </TableCell>

            {/* Price Per Bag */}
            <TableCell className="font-bold text-success dark:text-accent">
              ${formatCurrency(bag.price)}
            </TableCell>

            {/* Status */}
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
        title={dialogMode === "edit" ? "Edit Bag Pricing" : "Set Bag Pricing"}
        description={
          dialogMode === "edit"
            ? "Update the extra bag details."
            : "Create pricing for additional part bags."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Pricing" : "Create Pricing"
        }
      >
        <div className="space-y-4">
          {/* Sub-Collection */}
          <div className="space-y-2">
            <Label htmlFor="subCollectionId">Sub-Collection</Label>
            <Select
              value={formData.subCollectionId}
              onValueChange={handleValueChange("subCollectionId")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="subCollectionId" className="w-full">
                <SelectValue placeholder="Select Sub-Collection" />
              </SelectTrigger>
              <SelectContent>
                {subCollections.map((sc) => (
                  <SelectItem key={sc._id} value={sc._id}>
                    {sc.subCollectionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price Per Bag</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="50.00"
              value={formData.price}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this pricing will not be available in the dealer portal"
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
        itemName={`${display(
          selectedItem?.subCollectionId?.subCollectionName,
        )} Pricing`}
        title="Delete Bag Pricing"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerExtraBagManagement;
