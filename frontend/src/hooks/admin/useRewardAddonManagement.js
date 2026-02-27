import { useEffect } from "react";
import {
  useGetRewardAddonsQuery,
  useCreateRewardAddonMutation,
  useUpdateRewardAddonMutation,
  useDeleteRewardAddonMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { cleanFeatures } from "@/utils/formatting";
import { validateRewardAddon } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  price: "",
  quantity: "",
  duration: "",
  isActive: true,
  features: [""],
};

const columns = [
  { key: "duration", label: "Duration" },
  { key: "quantity", label: "Quantity" },
  { key: "price", label: "Price monthly" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useRewardAddonManagement = () => {
  // ------------------------------- Mutations ------------------------------------
  const [createAddon, { isLoading: isCreating }] =
    useCreateRewardAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] =
    useUpdateRewardAddonMutation();
  const [deleteAddon, { isLoading: isDeleting }] =
    useDeleteRewardAddonMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createAddon,
    updateFn: updateAddon,
    deleteFn: deleteAddon,
    entityName: "reward add-on",
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: addonsResponse, isLoading: isLoadingAddons } =
    useGetRewardAddonsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: addons,
    totalItems,
    totalPages,
  } = extractPaginatedData(addonsResponse, "addons");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  // ------------------------------- Submit Mode ------------------------------------
  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (addon) => {
    crud.openEdit(addon, {
      price: addon.price || "",
      quantity: addon.quantity || "",
      duration: addon.duration || "",
      isActive: addon.isActive !== false,
      features: addon.features?.length ? addon.features : [""],
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateRewardAddon(crud.formData)) return;

    const payload = {
      ...(crud.formData.price && {
        price: Number(crud.formData.price),
      }),
      ...(crud.formData.quantity && {
        quantity: Number(crud.formData.quantity),
      }),
      ...(crud.formData.duration && {
        duration: Number(crud.formData.duration),
      }),
      isActive: crud.formData.isActive,
      features: cleanFeatures(crud.formData.features),
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

  const handleArrayChange = (arrayName, index) => (e) => {
    const value = e?.target ? e.target.value : e;
    crud.setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem =
    (arrayName, defaultValue = "") =>
    () => {
      crud.setFormData((prev) => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] || []), defaultValue],
      }));
    };

  const removeArrayItem = (arrayName, index) => () => {
    crud.setFormData((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).filter((_, i) => i !== index),
    }));
  };

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoadingAddons,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
  };
};

export default useRewardAddonManagement;
