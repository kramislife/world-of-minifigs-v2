import { useEffect } from "react";
import {
  useCreateColorMutation,
  useUpdateColorMutation,
  useGetColorsQuery,
  useDeleteColorMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizePayload, sanitizeString } from "@/utils/formatting";
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
  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createColor,
    updateFn: updateColor,
    deleteFn: deleteColor,
    entityName: "color",
  });

  // Fetch data
  const { data: colorsResponse, isLoading: isLoadingColors } =
    useGetColorsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: colors,
    totalItems,
    totalPages,
  } = extractPaginatedData(colorsResponse, "colors");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleColorPickerChange = (e) => {
    crud.setFormData((prev) => ({
      ...prev,
      hexCode: e.target.value.toUpperCase(),
    }));
  };

  const getColorPickerValue = () => {
    const hex = sanitizeString(crud.formData.hexCode);
    if (!hex) return "#000000";
    return hex.startsWith("#") ? hex : `#${hex}`;
  };

  const handleEdit = (color) => {
    crud.openEdit(color, {
      colorName: color.colorName || "",
      hexCode: color.hexCode || "",
      isActive: color.isActive !== false,
    });
  };

  const handleSubmit = async () => {
    if (!validateColor(crud.formData)) return;

    const payload = {
      colorName: crud.formData.colorName,
      hexCode: crud.formData.hexCode,
      isActive: crud.formData.isActive,
    };

    await crud.submitForm(payload);
  };

  return {
    ...crud,
    selectedColor: crud.selectedItem,
    colors,
    totalItems,
    totalPages,
    columns,
    isLoadingColors,
    isSubmitting,
    isDeleting,

    // Handlers
    handleColorPickerChange,
    getColorPickerValue,
    handleSubmit,
    handleEdit,
  };
};

export default useColorManagement;
