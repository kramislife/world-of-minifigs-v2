import { toast } from "sonner";
import {
  useGetRewardAddonsQuery,
  useCreateRewardAddonMutation,
  useUpdateRewardAddonMutation,
  useDeleteRewardAddonMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  price: "",
  quantity: "",
  duration: "",
  isActive: true,
  features: [""],
};

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

  const columns = [
    { key: "duration", label: "Duration" },
    { key: "quantity", label: "Quantity" },
    { key: "price", label: "Price monthly" },
    { key: "isActive", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleEdit = (addon) => {
    crud.openEdit(addon, {
      price: addon.price,
      quantity: addon.quantity || "",
      duration: addon.duration || "",
      isActive: addon.isActive,
      features: addon.features?.length > 0 ? addon.features : [""],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.quantity) {
      toast.error("Quantity is required");
      return;
    }

    const cleanFeatures = (crud.formData.features || [])
      .map((f) => (f || "").trim())
      .filter((f) => f !== "");

    await crud.submitForm({
      price: crud.formData.price ? Number(crud.formData.price) : undefined,
      quantity: crud.formData.quantity
        ? Number(crud.formData.quantity)
        : undefined,
      duration: crud.formData.duration
        ? Number(crud.formData.duration)
        : undefined,
      isActive: crud.formData.isActive,
      features: cleanFeatures,
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedAddon: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoadingAddons,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleDialogClose: crud.handleDialogClose,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
    setFormData: crud.setFormData,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleSubmit,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
  };
};

export default useRewardAddonManagement;
