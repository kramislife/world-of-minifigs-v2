import { toast } from "sonner";
import {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetCategoriesQuery,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  subCategoryName: "",
  description: "",
  category: "",
};

const useSubCategoryManagement = () => {
  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] =
    useUpdateSubCategoryMutation();
  const [deleteSubCategory, { isLoading: isDeleting }] =
    useDeleteSubCategoryMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createSubCategory,
    updateFn: updateSubCategory,
    deleteFn: deleteSubCategory,
    entityName: "sub-category",
  });

  // Fetch data
  const { data: subCategoriesData, isLoading: isLoadingSubCategories } =
    useGetSubCategoriesQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();

  const {
    items: subCategories,
    totalItems,
    totalPages,
  } = extractPaginatedData(subCategoriesData, "subCategories");
  const categories = categoriesData?.categories || [];

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
    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    crud.setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleEdit = (subCategory) => {
    crud.openEdit(subCategory, {
      subCategoryName: subCategory.subCategoryName || "",
      description: subCategory.description || "",
      category: subCategory.categoryId?._id || subCategory.categoryId || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.subCategoryName.trim()) {
      toast.error("Sub-category name is required", {
        description: "Please enter a sub-category name.",
      });
      return;
    }

    if (!crud.formData.category) {
      toast.error("Category is required", {
        description: "Please select a parent category.",
      });
      return;
    }

    await crud.submitForm({
      subCategoryName: crud.formData.subCategoryName.trim(),
      description: crud.formData.description.trim(),
      category: crud.formData.category,
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedSubCategory: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
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

export default useSubCategoryManagement;
