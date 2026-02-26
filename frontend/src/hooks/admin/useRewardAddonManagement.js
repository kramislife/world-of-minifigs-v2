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
  const [createAddon, { isLoading: isCreating }] =
    useCreateRewardAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] =
    useUpdateRewardAddonMutation();
  const [deleteAddon, { isLoading: isDeleting }] =
    useDeleteRewardAddonMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createAddon,
    updateFn: updateAddon,
    deleteFn: deleteAddon,
    entityName: "reward add-on",
  });

  // Fetch data
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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (addon) => {
    crud.openEdit(addon, {
      price: addon.price,
      quantity: addon.quantity || "",
      duration: addon.duration || "",
      isActive: addon.isActive,
      features: addon.features?.length > 0 ? addon.features : [""],
    });
  };

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

  return {
    ...crud,
    selectedAddon: crud.selectedItem,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoadingAddons,
    isSubmitting,
    isDeleting,

    // Handlers
    handleEdit,
    handleSubmit,
  };
};

export default useRewardAddonManagement;
