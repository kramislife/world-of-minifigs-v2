import { useEffect } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizePayload } from "@/utils/formatting";
import { validateCategory } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  categoryName: "",
  description: "",
  isActive: true,
};

const columns = [
  { key: "categoryName", label: "Name" },
  { key: "description", label: "Description" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

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

  const {
    items: categories,
    totalItems,
    totalPages,
  } = extractPaginatedData(categoriesResponse, "categories");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (category) => {
    crud.openEdit(category, {
      categoryName: category.categoryName || "",
      description: category.description || "",
      isActive: category.isActive !== false,
    });
  };

const handleSubmit = async () => {
  if (!validateCategory(crud.formData)) return;

  const payload = {
    categoryName: crud.formData.categoryName,
    description: crud.formData.description,
    isActive: crud.formData.isActive,
  };

  await crud.submitForm(payload);
};

  return {
    ...crud,
    categories,
    totalItems,
    totalPages,
    columns,
    isLoadingCategories,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
  };
};

export default useCategoryManagement;
