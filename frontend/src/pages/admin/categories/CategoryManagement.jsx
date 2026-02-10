import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useCategoryManagement from "@/hooks/admin/useCategoryManagement";

const CategoryManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedCategory,
    dialogMode,
    formData,
    page,
    limit,
    search,
    categories,
    totalItems,
    totalPages,
    columns,
    isLoadingCategories,
    isCreating,
    isUpdating,
    isDeleting,
    handleChange,
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
  } = useCategoryManagement();

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product categories in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={categories}
        isLoading={isLoadingCategories}
        renderRow={(category) => (
          <>
            <TableCell maxWidth="200px">{category.categoryName}</TableCell>
            <TableCell maxWidth="300px">
              {category.description || "-"}
            </TableCell>
            <TableCell>
              {category.createdAt
                ? new Date(category.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {category.updatedAt
                ? new Date(category.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category)}
            />
          </>
        )}
      />

      {/* Add/Edit Category Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Category" : "Add New Category"}
        description={
          dialogMode === "edit"
            ? "Update the category details."
            : "Create a new category for your products."
        }
        onSubmit={handleSubmit}
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit" ? "Update Category" : "Create Category"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="categoryName">Category Name</Label>
          <Input
            id="categoryName"
            name="categoryName"
            type="text"
            placeholder="e.g., Vehicles, Buildings, Minifigures"
            value={formData.categoryName}
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
            placeholder="Enter category description (optional)"
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
        itemName={selectedCategory?.categoryName || ""}
        title="Delete Category"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoryManagement;
