import { useEffect } from "react";
import {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetCategoriesQuery,
} from "@/redux/api/adminApi";
import { sanitizePayload } from "@/utils/formatting";
import { validateSubCategory } from "@/utils/validation";
import { extractPaginatedData } from "@/utils/apiHelpers";
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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleCategoryChange = (value) => {
    crud.setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleEdit = (subCategory) => {
    crud.openEdit(subCategory, {
      subCategoryName: subCategory.subCategoryName || "",
      description: subCategory.description || "",
      category: subCategory.categoryId?._id || subCategory.categoryId || "",
      isActive: subCategory.isActive !== false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSubCategory(crud.formData)) return;

    await crud.submitForm({
      ...sanitizePayload(crud.formData, ["subCategoryName", "description"]),
      category: crud.formData.category,
      isActive: crud.formData.isActive,
    });
  };

  return {
    ...crud,
    selectedSubCategory: crud.selectedItem,
    subCategories,
    totalItems,
    totalPages,
    categories,
    columns,
    isLoadingSubCategories,
    isLoadingCategories,
    isSubmitting,
    isDeleting,

    // Handlers
    handleCategoryChange,
    handleSubmit,
    handleEdit,
  };
};

export default useSubCategoryManagement;
