import { useState } from "react";
import { toast } from "sonner";
import {
  useGetRewardBundlesQuery,
  useCreateRewardBundleMutation,
  useUpdateRewardBundleMutation,
  useDeleteRewardBundleMutation,
} from "@/redux/api/adminApi";

const useRewardBundleManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedBundle, setSelectedBundle] = useState(null);

  const [formData, setFormData] = useState({
    bundleName: "",
    minifigQuantity: "",
    totalPrice: "",
    isActive: true,
    features: [""],
  });

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetRewardBundlesQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [createBundle, { isLoading: isCreating }] =
    useCreateRewardBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] =
    useUpdateRewardBundleMutation();
  const [deleteBundle, { isLoading: isDeleting }] =
    useDeleteRewardBundleMutation();

  const bundles = data?.bundles || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  const columns = [
    { label: "Bundle", key: "bundleName" },
    { label: "Quantity", key: "minifigQuantity" },
    { label: "Total Price", key: "totalPrice" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
  ];

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
        bundleName: "",
        minifigQuantity: "",
        totalPrice: "",
        isActive: true,
        features: [""],
      });
      setSelectedBundle(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedBundle(null);
    setFormData({
      bundleName: "",
      minifigQuantity: "",
      totalPrice: "",
      isActive: true,
      features: [""],
    });
    setDialogOpen(true);
  };

  const handleEdit = (bundle) => {
    setDialogMode("edit");
    setSelectedBundle(bundle);
    setFormData({
      bundleName: bundle.bundleName,
      minifigQuantity: bundle.minifigQuantity,
      totalPrice: bundle.totalPrice ?? "",
      isActive: bundle.isActive,
      features: bundle.features?.length > 0 ? bundle.features : [""],
    });
    setDialogOpen(true);
  };

  const handleDelete = (bundle) => {
    setSelectedBundle(bundle);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bundleName.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (!formData.minifigQuantity || Number(formData.minifigQuantity) <= 0) {
      toast.error("Valid quantity is required");
      return;
    }
    if (formData.totalPrice === "" || Number(formData.totalPrice) < 0) {
      toast.error("Valid total price is required");
      return;
    }

    const cleanFeatures = formData.features
      .map((f) => f.trim())
      .filter((f) => f !== "");

    const payload = {
      bundleName: formData.bundleName.trim(),
      minifigQuantity: Number(formData.minifigQuantity),
      totalPrice: Number(formData.totalPrice),
      features: cleanFeatures,
      isActive: formData.isActive,
    };

    try {
      if (dialogMode === "add") {
        const response = await createBundle(payload).unwrap();
        if (response.success) {
          toast.success(
            response.message || "Reward bundle created successfully",
            {
              description:
                response.description ||
                `The bundle "${response.bundle.bundleName}" has been added.`,
            },
          );
          handleDialogClose(false);
        }
      } else {
        const response = await updateBundle({
          id: selectedBundle._id,
          ...payload,
        }).unwrap();
        if (response.success) {
          toast.success(
            response.message || "Reward bundle updated successfully",
            {
              description:
                response.description ||
                `The bundle "${response.bundle.bundleName}" has been updated.`,
            },
          );
          handleDialogClose(false);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save bundle", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBundle) return;
    try {
      const response = await deleteBundle(selectedBundle._id).unwrap();
      if (response.success) {
        toast.success(
          response.message || "Reward bundle deleted successfully",
          {
            description: response.description || "The bundle has been removed.",
          },
        );
        setDeleteDialogOpen(false);
        setSelectedBundle(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete bundle", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  return {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedBundle,
    formData,
    bundles,
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

export default useRewardBundleManagement;
