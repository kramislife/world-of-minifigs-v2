import React from "react";
import { formatDate } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useSubCategoryManagement from "@/hooks/admin/useSubCategoryManagement";

const SubCategoryManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedSubCategory,
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
    handleCategoryChange,
    handleSwitchChange,
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
      <AdminManagementHeader
        title="Sub-category Management"
        description="Manage product sub-categories in your store"
        actionLabel="Add Sub-category"
        onAction={handleAdd}
      />

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
            <TableCell maxWidth="200px">
              {subCategory.subCategoryName}
            </TableCell>
            <TableCell maxWidth="200px">
              {subCategory.categoryId?.categoryName || "-"}
            </TableCell>
            <TableCell maxWidth="300px">
              {subCategory.description || "-"}
            </TableCell>
            <TableCell>
              {subCategory.isActive ? (
                <Badge variant="accent">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {subCategory.createdAt ? formatDate(subCategory.createdAt) : "-"}
            </TableCell>
            <TableCell>
              {subCategory.updatedAt ? formatDate(subCategory.updatedAt) : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(subCategory)}
              onDelete={() => handleDelete(subCategory)}
            />
          </>
        )}
      />

      {/* Add/Edit Sub-category Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={
          dialogMode === "edit" ? "Edit Sub-category" : "Add New Sub-category"
        }
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
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={handleCategoryChange}
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
                  <SelectItem
                    key={category._id || category.id}
                    value={category._id || category.id}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subCategoryName">Sub-category Name</Label>
          <Input
            id="subCategoryName"
            name="subCategoryName"
            type="text"
            placeholder="e.g., Cars, Trucks, Houses"
            value={formData.subCategoryName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

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

        <AdminSwitchField
          id="isActive"
          label="Visibility"
          description="When disabled, this sub-category will not appear in product filters or public listings"
          checked={formData.isActive}
          onChange={handleSwitchChange("isActive")}
          disabled={isSubmitting}
        />
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedSubCategory?.subCategoryName || ""}
        title="Delete Sub-category"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SubCategoryManagement;
