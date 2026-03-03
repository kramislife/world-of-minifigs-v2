import React from "react";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import {
  AdminFormInput,
  AdminFormSelect,
} from "@/components/shared/AdminFormInput";
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
    columns,
    isLoadingExtraBags,
    isLoadingSubCollections,
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
              {formatCurrency(bag.price)}
            </TableCell>

            {/* Status */}
            <StatusCell isActive={bag.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={bag.createdAt}
              updatedAt={bag.updatedAt}
            />

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
        entityName="Bag Pricing"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {/* Sub-Collection Select */}
          <AdminFormSelect
            label="Sub-Collection"
            name="subCollection"
            value={formData.subCollection}
            onValueChange={handleValueChange("subCollection")}
            options={subCollections}
            getValue={(item) => item._id}
            getLabel={(item) => item.subCollectionName}
            placeholder="Select Sub-Collection"
            isLoading={isLoadingSubCollections}
            disabled={isSubmitting}
          />

          {/* Price */}
          <AdminFormInput
            label="Price Per Bag"
            name="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

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
