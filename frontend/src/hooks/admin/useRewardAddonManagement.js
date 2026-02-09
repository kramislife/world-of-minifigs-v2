import { useState } from "react";
import { toast } from "sonner";
import {
  useGetRewardAddonsQuery,
  useCreateRewardAddonMutation,
  useUpdateRewardAddonMutation,
  useDeleteRewardAddonMutation,
} from "@/redux/api/adminApi";

const useRewardAddonManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedAddon, setSelectedAddon] = useState(null);

  const [formData, setFormData] = useState({
    addonName: "",
    price: "",
    isActive: true,
    features: [""],
  });

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetRewardAddonsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [createAddon, { isLoading: isCreating }] =
    useCreateRewardAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] =
    useUpdateRewardAddonMutation();
  const [deleteAddon, { isLoading: isDeleting }] =
    useDeleteRewardAddonMutation();

  const addons = data?.addons || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  const columns = [
    { label: "Add-on", key: "addonName" },
    { label: "Price monthly", key: "price" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
  ];

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
        addonName: "",
        price: "",
        isActive: true,
        features: [""],
      });
      setSelectedAddon(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedAddon(null);
    setFormData({
      addonName: "",
      price: "",
      description: "",
      isActive: true,
      features: [""],
    });
    setDialogOpen(true);
  };

  const handleEdit = (addon) => {
    setDialogMode("edit");
    setSelectedAddon(addon);
    setFormData({
      addonName: addon.addonName,
      price: addon.price,
      isActive: addon.isActive,
      features: addon.features?.length > 0 ? addon.features : [""],
    });
    setDialogOpen(true);
  };

  const handleDelete = (addon) => {
    setSelectedAddon(addon);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.addonName.trim()) {
      toast.error("Add-on name is required");
      return;
    }

    const cleanFeatures = formData.features
      ? formData.features.map((f) => (f || "").trim()).filter((f) => f !== "")
      : [];

    const payload = {
      ...formData,
      price: formData.price ? Number(formData.price) : undefined,
      features: cleanFeatures,
    };

    try {
      if (dialogMode === "add") {
        const response = await createAddon(payload).unwrap();
        if (response.success) {
          toast.success(
            response.message || "Reward add-on created successfully",
            {
              description:
                response.description ||
                `The add-on "${response.addon.addonName}" has been added.`,
            },
          );
          handleDialogClose(false);
        }
      } else {
        const response = await updateAddon({
          id: selectedAddon._id,
          ...payload,
        }).unwrap();
        if (response.success) {
          toast.success(
            response.message || "Reward add-on updated successfully",
            {
              description:
                response.description ||
                `The add-on "${response.addon.addonName}" has been updated.`,
            },
          );
          handleDialogClose(false);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save add-on", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAddon) return;
    try {
      const response = await deleteAddon(selectedAddon._id).unwrap();
      if (response.success) {
        toast.success(
          response.message || "Reward add-on deleted successfully",
          {
            description: response.description || "The add-on has been removed.",
          },
        );
        setDeleteDialogOpen(false);
        setSelectedAddon(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete add-on", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (p) => setPage(p);
  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
  };
  const handleSearchChange = (s) => {
    setSearch(s);
    setPage(1);
  };

  return {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedAddon,
    formData,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  };
};

export default useRewardAddonManagement;
