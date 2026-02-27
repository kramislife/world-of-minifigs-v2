import React from "react";
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
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import { formatDate, display } from "@/utils/formatting";
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
            <TableCell>
              <StatusBadge isActive={subCategory.isActive} />
            </TableCell>

            {/* Created At */}
            <TableCell>{formatDate(subCategory.createdAt)}</TableCell>

            {/* Updated At */}
            <TableCell>{formatDate(subCategory.updatedAt)}</TableCell>

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
        title={dialogMode === "edit" ? "Edit Sub-category" : "Add Sub-category"}
        description={
          dialogMode === "edit"
            ? "Update the sub-category details."
            : "Create a new sub-category for your products."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Sub-category" : "Create Sub-category"
        }
      >
        <div className="space-y-4">
          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleValueChange("category")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.categoryName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-category Name */}
          <div className="space-y-2">
            <Label htmlFor="subCategoryName">Sub-category Name</Label>
            <Input
              id="subCategoryName"
              name="subCategoryName"
              placeholder="e.g., Cars, Trucks, Houses"
              value={formData.subCategoryName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter sub-category description (optional)"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this sub-category will not appear in public listings"
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
