import { useEffect, useMemo } from "react";
import {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetCategoriesQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString, sortByName } from "@/utils/formatting";
import { validateSubCategory } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  subCategoryName: "",
  description: "",
  category: "",
  isActive: true,
};

const columns = [
  { key: "subCategoryName", label: "Sub-category" },
  { key: "category", label: "Category" },
  { key: "description", label: "Description" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useSubCategoryManagement = () => {
  // ------------------------------- Mutations ------------------------------------
  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] =
    useUpdateSubCategoryMutation();
  const [deleteSubCategory, { isLoading: isDeleting }] =
    useDeleteSubCategoryMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createSubCategory,
    updateFn: updateSubCategory,
    deleteFn: deleteSubCategory,
    entityName: "sub-category",
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();

  const { data: subCategoriesData, isLoading: isLoadingSubCategories } =
    useGetSubCategoriesQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: subCategories,
    totalItems,
    totalPages,
  } = extractPaginatedData(subCategoriesData, "subCategories");

  const categories = useMemo(
    () => sortByName(categoriesData?.categories, "categoryName"),
    [categoriesData],
  );

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (subCategory) => {
    crud.openEdit(subCategory, {
      category: subCategory.categoryId?._id || "",
      subCategoryName: subCategory.subCategoryName || "",
      description: subCategory.description || "",
      isActive: subCategory.isActive !== false,
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateSubCategory(crud.formData)) return;

    const payload = {
      category: crud.formData.category,
      subCategoryName: sanitizeString(crud.formData.subCategoryName),
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
    subCategories,
    totalItems,
    totalPages,
    categories,
    columns,
    isLoadingSubCategories,
    isLoadingCategories,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useSubCategoryManagement;
