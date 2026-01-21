import { useState } from "react";
import { toast } from "sonner";
import {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetCategoriesQuery,
} from "@/redux/api/adminApi";

const useSubCategoryManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState({
    subCategoryName: "",
    description: "",
    category: "",
  });

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: subCategoriesData, isLoading: isLoadingSubCategories } =
    useGetSubCategoriesQuery({
      page,
      limit,
      search: search || undefined,
    });
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();

  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] =
    useUpdateSubCategoryMutation();
  const [deleteSubCategory, { isLoading: isDeleting }] =
    useDeleteSubCategoryMutation();

  // Extract data from server response
  const subCategories = subCategoriesData?.subCategories || [];
  const totalItems = subCategoriesData?.pagination?.totalItems || 0;
  const totalPages = subCategoriesData?.pagination?.totalPages || 1;

  // Get categories list
  const categories = categoriesData?.categories || [];

  // Column definitions
  const columns = [
    { key: "subCategoryName", label: "Sub-category" },
    { key: "category", label: "Category" },
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

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subCategoryName.trim()) {
      toast.error("Sub-category name is required", {
        description: "Please enter a sub-category name.",
      });
      return;
    }

    if (!formData.category) {
      toast.error("Category is required", {
        description: "Please select a parent category.",
      });
      return;
    }

    try {
      const subCategoryData = {
        subCategoryName: formData.subCategoryName.trim(),
        description: formData.description.trim(),
        category: formData.category,
      };

      if (dialogMode === "edit" && selectedSubCategory) {
        const subCategoryId = selectedSubCategory._id || selectedSubCategory.id;
        const response = await updateSubCategory({
          id: subCategoryId,
          ...subCategoryData,
        }).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Sub-category updated successfully",
            {
              description:
                response.description ||
                `The sub-category "${response.subCategory.subCategoryName}" has been updated.`,
            }
          );

          setFormData({
            subCategoryName: "",
            description: "",
            category: "",
          });
          setSelectedSubCategory(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        const response = await createSubCategory(subCategoryData).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Sub-category created successfully",
            {
              description:
                response.description ||
                `The sub-category "${response.subCategory.subCategoryName}" has been created.`,
            }
          );

          setFormData({
            subCategoryName: "",
            description: "",
            category: "",
          });
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} sub-category error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${
            dialogMode === "edit" ? "update" : "create"
          } sub-category`,
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
        subCategoryName: "",
        description: "",
        category: "",
      });
      setSelectedSubCategory(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedSubCategory(null);
    setFormData({
      subCategoryName: "",
      description: "",
      category: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (subCategory) => {
    setDialogMode("edit");
    setSelectedSubCategory(subCategory);
    setFormData({
      subCategoryName: subCategory.subCategoryName || "",
      description: subCategory.description || "",
      category: subCategory.categoryId?._id || subCategory.categoryId || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubCategory) return;

    try {
      const subCategoryId = selectedSubCategory._id || selectedSubCategory.id;
      const response = await deleteSubCategory(subCategoryId).unwrap();

      if (response.success) {
        toast.success(response.message || "SubCategory deleted successfully", {
          description:
            response.description ||
            `The sub-category "${selectedSubCategory.subCategoryName}" has been removed.`,
        });

        setDeleteDialogOpen(false);
        setSelectedSubCategory(null);
      }
    } catch (error) {
      console.error("Delete sub-category error:", error);
      toast.error(error?.data?.message || "Failed to delete sub-category", {
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

    // Handlers
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
  };
};

export default useSubCategoryManagement;
