import { toast } from "sonner";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  categoryName: "",
  description: "",
};

const useCategoryManagement = () => {
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createCategory,
    updateFn: updateCategory,
    deleteFn: deleteCategory,
    entityName: "category",
  });

  // Fetch data
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetCategoriesQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { items: categories, totalItems, totalPages } =
    extractPaginatedData(categoriesResponse, "categories");

  const columns = [
    { key: "categoryName", label: "Name" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (category) => {
    crud.openEdit(category, {
      categoryName: category.categoryName || "",
      description: category.description || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.categoryName.trim()) {
      toast.error("Category name is required", {
        description: "Please enter a category name.",
      });
      return;
    }

    await crud.submitForm({
      categoryName: crud.formData.categoryName.trim(),
      description: crud.formData.description.trim(),
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedCategory: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
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
    handleDialogClose: crud.handleDialogClose,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
  };
};

export default useCategoryManagement;
