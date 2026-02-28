import { useEffect } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
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
  // ------------------------------- Mutations ------------------------------------
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createCategory,
    updateFn: updateCategory,
    deleteFn: deleteCategory,
    entityName: "category",
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: categories,
    totalItems,
    totalPages,
  } = extractPaginatedData(categoriesData, "categories");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (category) => {
    crud.openEdit(category, {
      categoryName: category.categoryName || "",
      description: category.description || "",
      isActive: category.isActive !== false,
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateCategory(crud.formData)) return;

    const payload = {
      categoryName: sanitizeString(crud.formData.categoryName),
      description: sanitizeString(crud.formData.description),
      isActive: crud.formData.isActive,
    };

    await crud.submitForm(payload);
  };

  // ------------------------------- Handlers ------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    crud.setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleValueChange = (field) => (value) => {
    crud.setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------------------- Return ------------------------------------
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
    handleChange,
    handleValueChange,
  };
};

export default useCategoryManagement;
