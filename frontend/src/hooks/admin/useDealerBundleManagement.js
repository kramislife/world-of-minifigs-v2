import { useState } from "react";
import { toast } from "sonner";
import {
  useGetDealerBundlesQuery,
  useCreateDealerBundleMutation,
  useUpdateDealerBundleMutation,
  useDeleteDealerBundleMutation,
} from "@/redux/api/adminApi";

const useDealerBundleManagement = () => {
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [selectedBundle, setSelectedBundle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    bundleName: "",
    minifigQuantity: "",
    unitPrice: "",
    isActive: true,
  });

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  // API Hooks
  const { data, isLoading, isFetching } = useGetDealerBundlesQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [createBundle, { isLoading: isCreating }] =
    useCreateDealerBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] =
    useUpdateDealerBundleMutation();
  const [deleteBundle, { isLoading: isDeleting }] =
    useDeleteDealerBundleMutation();

  const bundles = data?.bundles || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  // Derived State
  const calculatedTotal = (
    Number(formData.minifigQuantity || 0) * Number(formData.unitPrice || 0)
  ).toFixed(2);

  const columns = [
    { label: "Bundle", key: "bundleName" },
    { label: "Quantity", key: "minifigQuantity" },
    { label: "Unit Price", key: "unitPrice" },
    { label: "Total Price", key: "totalPrice" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
  ];

  // Handlers
  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
        bundleName: "",
        minifigQuantity: "",
        unitPrice: "",
        isActive: true,
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
      unitPrice: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (bundle) => {
    setDialogMode("edit");
    setSelectedBundle(bundle);
    setFormData({
      bundleName: bundle.bundleName,
      minifigQuantity: bundle.minifigQuantity,
      unitPrice: bundle.unitPrice,
      isActive: bundle.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (bundle) => {
    setSelectedBundle(bundle);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.bundleName.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (!formData.minifigQuantity || Number(formData.minifigQuantity) <= 0) {
      toast.error("Valid quantity is required");
      return;
    }
    if (formData.unitPrice === "" || Number(formData.unitPrice) < 0) {
      toast.error("Valid unit price is required");
      return;
    }

    const payload = {
      ...formData,
      minifigQuantity: Number(formData.minifigQuantity),
      unitPrice: Number(formData.unitPrice),
      totalPrice: Number(calculatedTotal),
    };

    try {
      if (dialogMode === "add") {
        const response = await createBundle(payload).unwrap();
        if (response.success) {
          toast.success(response.message || "Bundle created successfully", {
            description:
              response.description ||
              `The bundle "${response.bundle.bundleName}" has been added.`,
          });
          handleDialogClose(false);
        }
      } else {
        const response = await updateBundle({
          id: selectedBundle._id,
          ...payload,
        }).unwrap();
        if (response.success) {
          toast.success(response.message || "Bundle updated successfully", {
            description:
              response.description ||
              `The bundle "${response.bundle.bundleName}" has been updated.`,
          });
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
        toast.success(response.message || "Bundle deleted successfully", {
          description: response.description || "The bundle has been removed.",
        });
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
    // State
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
    calculatedTotal,
    columns,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
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

export default useDealerBundleManagement;
