import { useState } from "react";
import { toast } from "sonner";
import {
  useGetDealerExtraBagsQuery,
  useCreateDealerExtraBagMutation,
  useUpdateDealerExtraBagMutation,
  useDeleteDealerExtraBagMutation,
  useGetSubCollectionsQuery,
} from "@/redux/api/adminApi";

const useDealerExtraBagManagement = () => {
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedBag, setSelectedBag] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subCollectionId: "",
    price: "",
    isActive: true,
  });

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  // API Hooks
  const { data, isLoading, isFetching } = useGetDealerExtraBagsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const { data: subCollectionsData } = useGetSubCollectionsQuery({
    limit: 1000,
  });
  const subCollections = subCollectionsData?.subCollections || [];

  const [createExtraBag, { isLoading: isCreating }] =
    useCreateDealerExtraBagMutation();
  const [updateExtraBag, { isLoading: isUpdating }] =
    useUpdateDealerExtraBagMutation();
  const [deleteExtraBag, { isLoading: isDeleting }] =
    useDeleteDealerExtraBagMutation();

  const extraBags = data?.extraBags || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  const columns = [
    { label: "Part Type", key: "subCollectionId" },
    { label: "Price Per Bag", key: "price" },
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
        subCollectionId: "",
        price: "",
        isActive: true,
      });
      setSelectedBag(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedBag(null);
    setFormData({
      subCollectionId: "",
      price: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (bag) => {
    setDialogMode("edit");
    setSelectedBag(bag);
    setFormData({
      subCollectionId: bag.subCollectionId?._id || "",
      price: bag.price,
      isActive: bag.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (bag) => {
    setSelectedBag(bag);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dialogMode === "add") {
        const response = await createExtraBag(formData).unwrap();
        if (response.success) {
          toast.success(response.message || "Bag pricing set successfully", {
            description:
              response.description ||
              "Pricing for this category has been added.",
          });
          handleDialogClose(false);
        }
      } else {
        const response = await updateExtraBag({
          id: selectedBag._id,
          ...formData,
        }).unwrap();
        if (response.success) {
          toast.success(
            response.message || "Bag pricing updated successfully",
            {
              description:
                response.description ||
                "The bag pricing details have been updated.",
            },
          );
          handleDialogClose(false);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save bag pricing", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBag) return;
    try {
      const response = await deleteExtraBag(selectedBag._id).unwrap();
      if (response.success) {
        toast.success(response.message || "Bag pricing removed successfully", {
          description:
            response.description || "The bag pricing has been removed.",
        });
        setDeleteDialogOpen(false);
        setSelectedBag(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete bag pricing", {
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
    // State
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedBag,
    formData,
    subCollections,
    extraBags,
    totalItems,
    totalPages,
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

export default useDealerExtraBagManagement;
