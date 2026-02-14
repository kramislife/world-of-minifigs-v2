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
  const { data, isLoading, isFetching } = useGetRewardAddonsQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const {
    items: addons,
    totalItems,
    totalPages,
  } = extractPaginatedData(data, "addons");

  const columns = [
    { label: "Duration", key: "duration" },
    { label: "Quantity", key: "quantity" },
    { label: "Price monthly", key: "price" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
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

    const cleanFeatures = crud.formData.features
      ? crud.formData.features
          .map((f) => (f || "").trim())
          .filter((f) => f !== "")
      : [];

    await crud.submitForm({
      ...crud.formData,
      price: crud.formData.price ? Number(crud.formData.price) : undefined,
      quantity: crud.formData.quantity
        ? Number(crud.formData.quantity)
        : undefined,
      duration: crud.formData.duration
        ? Number(crud.formData.duration)
        : undefined,
      features: cleanFeatures,
    });
  };

  return {
    search: crud.search,
    limit: crud.limit,
    page: crud.page,
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    dialogMode: crud.dialogMode,
    selectedAddon: crud.selectedItem,
    formData: crud.formData,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
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
