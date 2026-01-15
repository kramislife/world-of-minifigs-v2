import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateColorMutation,
  useUpdateColorMutation,
  useGetColorsQuery,
  useDeleteColorMutation,
} from "@/redux/api/adminApi";

const useColorManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState({
    colorName: "",
    hexCode: "",
  });

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: colorsResponse, isLoading: isLoadingColors } =
    useGetColorsQuery({
      page,
      limit,
      search: search || undefined,
    });

  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  // Extract data from server response
  const colors = colorsResponse?.colors || [];
  const totalItems = colorsResponse?.pagination?.totalItems || 0;
  const totalPages = colorsResponse?.pagination?.totalPages || 1;

  // Column definitions
  const columns = [
    { key: "colorName", label: "Color Name" },
    { key: "hexCode", label: "Hex Code" },
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

  const handleColorPickerChange = (e) => {
    const colorValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      hexCode: colorValue.toUpperCase(),
    }));
  };

  const getColorPickerValue = () => {
    if (!formData.hexCode.trim()) return "#000000";
    const hex = formData.hexCode.trim();
    return hex.startsWith("#") ? hex : `#${hex}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.colorName.trim()) {
      toast.error("Color name is required", {
        description: "Please enter a color name.",
      });
      return;
    }

    if (!formData.hexCode.trim()) {
      toast.error("Hex code is required", {
        description: "Please enter a hex color code.",
      });
      return;
    }

    const hexPattern = /^#?[0-9A-F]{6}$/i;
    if (!hexPattern.test(formData.hexCode.trim())) {
      toast.error("Invalid hex code format", {
        description:
          "Hex code must be in format #RRGGBB or RRGGBB (e.g., #FF5733 or FF5733).",
      });
      return;
    }

    try {
      const colorData = {
        colorName: formData.colorName.trim(),
        hexCode: formData.hexCode.trim(),
      };

      if (dialogMode === "edit" && selectedColor) {
        const colorId = selectedColor._id || selectedColor.id;
        const response = await updateColor({
          id: colorId,
          ...colorData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Color updated successfully", {
            description:
              response.description ||
              `The color "${response.color.colorName}" has been updated.`,
          });

          setFormData({
            colorName: "",
            hexCode: "",
          });
          setSelectedColor(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        const response = await createColor(colorData).unwrap();

        if (response.success) {
          toast.success(response.message || "Color created successfully", {
            description:
              response.description ||
              `The color "${response.color.colorName}" has been added.`,
          });

          setFormData({
            colorName: "",
            hexCode: "",
          });
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} color error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${dialogMode === "edit" ? "update" : "create"} color`,
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
        colorName: "",
        hexCode: "",
      });
      setSelectedColor(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedColor(null);
    setFormData({
      colorName: "",
      hexCode: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (color) => {
    setDialogMode("edit");
    setSelectedColor(color);
    setFormData({
      colorName: color.colorName || "",
      hexCode: color.hexCode || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (color) => {
    setSelectedColor(color);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedColor) return;

    try {
      const colorId = selectedColor._id || selectedColor.id;
      const response = await deleteColor(colorId).unwrap();

      if (response.success) {
        toast.success(response.message || "Color deleted successfully", {
          description:
            response.description ||
            `The color "${selectedColor.colorName}" has been removed.`,
        });

        setDeleteDialogOpen(false);
        setSelectedColor(null);
      }
    } catch (error) {
      console.error("Delete color error:", error);
      toast.error(error?.data?.message || "Failed to delete color", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle pagination and search changes
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
    selectedColor,
    dialogMode,
    formData,
    page,
    limit,
    search,
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

export default useColorManagement;
