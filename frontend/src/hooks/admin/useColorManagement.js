import { toast } from "sonner";
import {
  useCreateColorMutation,
  useUpdateColorMutation,
  useGetColorsQuery,
  useDeleteColorMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  colorName: "",
  hexCode: "",
};

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

  const { items: colors, totalItems, totalPages } =
    extractPaginatedData(colorsResponse, "colors");

  const columns = [
    { key: "colorName", label: "Color Name" },
    { key: "hexCode", label: "Hex Code" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorPickerChange = (e) => {
    const colorValue = e.target.value;
    crud.setFormData((prev) => ({
      ...prev,
      hexCode: colorValue.toUpperCase(),
    }));
  };

  const getColorPickerValue = () => {
    if (!crud.formData.hexCode.trim()) return "#000000";
    const hex = crud.formData.hexCode.trim();
    return hex.startsWith("#") ? hex : `#${hex}`;
  };

  const handleEdit = (color) => {
    crud.openEdit(color, {
      colorName: color.colorName || "",
      hexCode: color.hexCode || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.colorName.trim()) {
      toast.error("Color name is required", {
        description: "Please enter a color name.",
      });
      return;
    }

    if (!crud.formData.hexCode.trim()) {
      toast.error("Hex code is required", {
        description: "Please enter a hex color code.",
      });
      return;
    }

    const hexPattern = /^#?[0-9A-F]{6}$/i;
    if (!hexPattern.test(crud.formData.hexCode.trim())) {
      toast.error("Invalid hex code format", {
        description:
          "Hex code must be in format #RRGGBB or RRGGBB (e.g., #FF5733 or FF5733).",
      });
      return;
    }

    await crud.submitForm({
      colorName: crud.formData.colorName.trim(),
      hexCode: crud.formData.hexCode.trim(),
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedColor: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    colors,
    totalItems,
    totalPages,
    columns,
    isLoadingColors,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleChange,
    handleColorPickerChange,
    getColorPickerValue,
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

export default useColorManagement;
