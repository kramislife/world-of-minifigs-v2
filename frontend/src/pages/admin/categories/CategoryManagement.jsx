import React from "react";
import { formatDate } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useCategoryManagement from "@/hooks/admin/useCategoryManagement";

const CategoryManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    categories,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingCategories,
    isSubmitting,
    isDeleting,
    handleChange,
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
  } = useCategoryManagement();

  return (
    <div className="space-y-5">
      <AdminManagementHeader
        title="Category Management"
        description="Manage product categories in your store"
        actionLabel="Add Category"
        onAction={handleAdd}
      />

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
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
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
              {category.isActive ? (
                <Badge variant="accent">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {category.createdAt ? formatDate(category.createdAt) : "-"}
            </TableCell>
            <TableCell>
              {category.updatedAt ? formatDate(category.updatedAt) : "-"}
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
        isLoading={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <AdminSwitchField
          id="isActive"
          label="Visibility"
          description="When disabled, this category and its sub-categories will be hidden from product filters and public listings"
          checked={formData.isActive}
          onChange={handleSwitchChange("isActive")}
          disabled={isSubmitting}
        />
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedItem?.categoryName || ""}
        title="Delete Category"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoryManagement;
