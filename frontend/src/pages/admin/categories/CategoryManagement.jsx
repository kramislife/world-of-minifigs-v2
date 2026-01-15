import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/adminApi";

const CategoryManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
  });

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetCategoriesQuery({
      page,
      limit,
      search: search || undefined, // Only send if not empty
    });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // Extract data from server response
  const categories = categoriesResponse?.categories || [];
  const totalItems = categoriesResponse?.pagination?.totalItems || 0;
  const totalPages = categoriesResponse?.pagination?.totalPages || 1;

  // Column definitions based on Category model
  const columns = [
    { key: "categoryName", label: "Name" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.categoryName.trim()) {
      toast.error("Category name is required", {
        description: "Please enter a category name.",
      });
      return;
    }

    try {
      const categoryData = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim(),
      };

      if (dialogMode === "edit" && selectedCategory) {
        // Update existing category
        const categoryId = selectedCategory._id || selectedCategory.id;
        const response = await updateCategory({
          id: categoryId,
          ...categoryData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Category updated successfully", {
            description: `The category "${response.category.categoryName}" has been updated.`,
          });

          // Reset form and close dialog
          setFormData({
            categoryName: "",
            description: "",
          });
          setSelectedCategory(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        // Create new category
        const response = await createCategory(categoryData).unwrap();

        if (response.success) {
          toast.success(response.message || "Category created successfully", {
            description: `The category "${response.category.categoryName}" has been added.`,
          });

          // Reset form and close dialog
          setFormData({
            categoryName: "",
            description: "",
          });
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} category error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${dialogMode === "edit" ? "update" : "create"} category`,
        {
          description:
            error?.data?.description ||
            "An unexpected error occurred. Please try again.",
        }
      );
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      // Reset form and mode when dialog closes
      setFormData({
        categoryName: "",
        description: "",
      });
      setSelectedCategory(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedCategory(null);
    setFormData({
      categoryName: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (category) => {
    setDialogMode("edit");
    setSelectedCategory(category);
    setFormData({
      categoryName: category.categoryName || "",
      description: category.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      const categoryId = selectedCategory._id || selectedCategory.id;
      const response = await deleteCategory(categoryId).unwrap();

      toast.success(response.message || "Category deleted successfully", {
        description: `The category "${selectedCategory.categoryName}" has been removed.`,
      });

      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error(error?.data?.message || "Failed to delete category", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle pagination and search changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

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
        loadingMessage="Loading categories..."
        emptyMessage="No category found..."
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
