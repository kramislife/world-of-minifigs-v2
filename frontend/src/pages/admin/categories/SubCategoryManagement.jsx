import React from "react";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import {
  AdminFormInput,
  AdminFormTextarea,
  AdminFormSelect,
} from "@/components/shared/AdminFormInput";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import { display } from "@/utils/formatting";
import useSubCategoryManagement from "@/hooks/admin/useSubCategoryManagement";

const SubCategoryManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    subCategories,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    categories,
    columns,
    isLoadingSubCategories,
    isLoadingCategories,
    isSubmitting,
    isDeleting,
    handleChange,
    handleValueChange,
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
  } = useSubCategoryManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Sub-category Management"
        description="Manage product sub-categories in your store"
        actionLabel="Add Sub-category"
        onAction={handleAdd}
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search subcategories..."
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
        data={subCategories}
        isLoading={isLoadingSubCategories}
        renderRow={(subCategory) => (
          <>
            {/* Sub-category Name */}
            <TableCell maxWidth="200px">
              {display(subCategory.subCategoryName)}
            </TableCell>

            {/* Parent Category */}
            <TableCell maxWidth="200px">
              {display(subCategory.categoryId?.categoryName)}
            </TableCell>

            {/* Description */}
            <TableCell maxWidth="300px">
              {display(subCategory.description)}
            </TableCell>

            {/* Status */}
            <StatusCell isActive={subCategory.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={subCategory.createdAt}
              updatedAt={subCategory.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(subCategory)}
              onDelete={() => handleDelete(subCategory)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        entityName="Sub-category"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {/* Category Select */}
          <AdminFormSelect
            label="Category"
            name="category"
            value={formData.category}
            onValueChange={handleValueChange("category")}
            options={categories}
            getValue={(item) => item._id}
            getLabel={(item) => item.categoryName}
            placeholder="Select a category"
            isLoading={isLoadingCategories}
            disabled={isSubmitting}
          />

          {/* Sub-category Name */}
          <AdminFormInput
            label="Sub-category Name"
            name="subCategoryName"
            placeholder="Printed, Male, Casual"
            value={formData.subCategoryName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />

          {/* Description */}
          <AdminFormTextarea
            label="Description"
            name="description"
            placeholder="Enter sub-category description..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
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
        itemName={display(selectedItem?.subCategoryName)}
        title="Delete Sub-category"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SubCategoryManagement;
