import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/adminApi";

const useCategoryManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
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
      search: search || undefined,
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

  // Column definitions
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
        const categoryId = selectedCategory._id || selectedCategory.id;
        const response = await updateCategory({
          id: categoryId,
          ...categoryData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Category updated successfully", {
            description:
              response.description ||
              `The category "${response.category.categoryName}" has been updated.`,
          });

          setFormData({
            categoryName: "",
            description: "",
          });
          setSelectedCategory(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        const response = await createCategory(categoryData).unwrap();

        if (response.success) {
          toast.success(response.message || "Category created successfully", {
            description:
              response.description ||
              `The category "${response.category.categoryName}" has been added.`,
          });

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

      if (response.success) {
        toast.success(response.message || "Category deleted successfully", {
          description:
            response.description ||
            `The category "${selectedCategory.categoryName}" has been removed.`,
        });

        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error("Delete category error:", error);
      toast.error(error?.data?.message || "Failed to delete category", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return {
    // State
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

    // Handlers
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
  };
};

export default useCategoryManagement;
