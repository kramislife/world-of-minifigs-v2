import { useEffect } from "react";
import {
  useCreateColorMutation,
  useUpdateColorMutation,
  useGetColorsQuery,
  useDeleteColorMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
import { validateColor } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  colorName: "",
  hexCode: "",
  isActive: true,
};

const columns = [
  { key: "colorName", label: "Color Name" },
  { key: "hexCode", label: "Hex Code" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useColorManagement = () => {
  // ------------------------------- Mutations ------------------------------------
  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createColor,
    updateFn: updateColor,
    deleteFn: deleteColor,
    entityName: "color",
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: colorsData, isLoading: isLoadingColors } = useGetColorsQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const {
    items: colors,
    totalItems,
    totalPages,
  } = extractPaginatedData(colorsData, "colors");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Helpers ------------------------------------
  const handleColorPickerChange = (e) => {
    crud.setFormData((prev) => ({
      ...prev,
      hexCode: e.target.value.toUpperCase(),
    }));
  };

  const getColorPickerValue = () => {
    const hex = sanitizeString(crud.formData.hexCode).replace("#", "");
    return `#${hex || "000000"}`;
  };

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (color) => {
    crud.openEdit(color, {
      colorName: color.colorName || "",
      hexCode: color.hexCode || "",
      isActive: color.isActive !== false,
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateColor(crud.formData)) return;

    const payload = {
      colorName: sanitizeString(crud.formData.colorName),
      hexCode: sanitizeString(crud.formData.hexCode),
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
    colors,
    totalItems,
    totalPages,
    columns,
    isLoadingColors,
    isSubmitting,
    isDeleting,
    handleColorPickerChange,
    getColorPickerValue,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useColorManagement;
