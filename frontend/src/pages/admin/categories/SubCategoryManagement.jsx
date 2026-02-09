import React from "react";
import { Plus } from "lucide-react";
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
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
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
    categories,
    columns,
    isLoadingSubCategories,
    isLoadingCategories,
    isCreating,
    isUpdating,
    isDeleting,
    handleChange,
    handleCategoryChange,
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
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sub-category Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product sub-categories in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Sub-category
        </Button>
      </div>

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
              {subCategory.createdAt
                ? new Date(subCategory.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {subCategory.updatedAt
                ? new Date(subCategory.updatedAt).toLocaleString()
                : "-"}
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
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit" ? "Update Sub-category" : "Create Sub-category"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={handleCategoryChange}
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
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
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
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
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
            rows={4}
          />
        </div>
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

