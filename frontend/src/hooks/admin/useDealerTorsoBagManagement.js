import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  useGetDealerTorsoBagsQuery,
  useCreateDealerTorsoBagMutation,
  useUpdateDealerTorsoBagMutation,
  useDeleteDealerTorsoBagMutation,
  useGetDealerBundlesQuery,
} from "@/redux/api/adminApi";

const useDealerTorsoBagManagement = () => {
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedBag, setSelectedBag] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    bagName: "",
    isActive: true,
    items: [],
  });

  // Image Preview States
  const [itemPreviews, setItemPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  // API Hooks
  const { data, isLoading, isFetching } = useGetDealerTorsoBagsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const { data: bundlesData } = useGetDealerBundlesQuery({ limit: 100 });
  const bundles = bundlesData?.bundles || [];

  const [createBag, { isLoading: isCreating }] =
    useCreateDealerTorsoBagMutation();
  const [updateBag, { isLoading: isUpdating }] =
    useUpdateDealerTorsoBagMutation();
  const [deleteBag, { isLoading: isDeleting }] =
    useDeleteDealerTorsoBagMutation();

  const bags = data?.bags || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  // Derived State & Calculations
  const minRequired = useMemo(() => {
    if (!bundles || bundles.length === 0) return 100;
    const activeBundles = bundles.filter((b) => b.isActive);
    if (activeBundles.length === 0) return 100;
    return Math.min(...activeBundles.map((b) => b.minifigQuantity));
  }, [bundles]);

  const currentTotal = useMemo(() => {
    return formData.items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 1),
      0,
    );
  }, [formData.items]);

  const columns = [
    { label: "Bag Name", key: "bagName" },
    { label: "Designs Inside", key: "itemCount" },
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
        bagName: "",
        isActive: true,
        items: [],
      });
      setItemPreviews([]);
      setSelectedBag(null);
      setDialogMode("add");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedBag(null);
    setItemPreviews([]);
    setFormData({
      bagName: "",
      isActive: true,
      items: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (bag) => {
    setDialogMode("edit");
    setSelectedBag(bag);

    const existingItems =
      bag.items?.map((item) => ({
        url: item.image?.url,
        quantity: item.quantity,
        image: item.image,
      })) || [];

    setItemPreviews(existingItems);
    setFormData({
      bagName: bag.bagName,
      isActive: bag.isActive,
      items: existingItems,
    });
    setDialogOpen(true);
  };

  const handleDelete = (bag) => {
    setSelectedBag(bag);
    setDeleteDialogOpen(true);
  };

  const handleItemImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let tempTotal = currentTotal;
    let addedCount = 0;
    let skippedCount = 0;

    files.forEach((file) => {
      // Check if adding another 1 would exceed limit
      if (tempTotal + 1 > minRequired) {
        skippedCount++;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image "${file.name}" is too large`, {
          description: "Images must be less than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem = {
          url: reader.result,
          quantity: 1,
          image: { url: reader.result },
        };
        setItemPreviews((prev) => [...prev, newItem]);
        setFormData((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      };
      reader.readAsDataURL(file);
      tempTotal += 1;
      addedCount++;
    });

    if (skippedCount > 0) {
      toast.warning(`Limit reached: ${skippedCount} designs were skipped`, {
        description: `Your allocation target is ${minRequired} designs max.`,
      });
    }
  };

  const handleUpdateItemQuantity = (index, value) => {
    let cleaned = value.toString().replace(/[^0-9]/g, "");
    if (cleaned === "0") cleaned = "";

    // If typing a new number, validate it doesn't exceed the allocation limit
    if (cleaned !== "") {
      const newValue = parseInt(cleaned.slice(-1));

      const otherItemsTotal = formData.items.reduce(
        (acc, item, i) =>
          i === index ? acc : acc + (Number(item.quantity) || 1),
        0,
      );

      if (otherItemsTotal + newValue > minRequired) {
        toast.error("Allocation limit reached");
        return;
      }
      cleaned = newValue;
    }

    const updateMap = (items) =>
      items.map((item, i) =>
        i === index ? { ...item, quantity: cleaned } : item,
      );

    setItemPreviews((prev) => updateMap(prev));
    setFormData((prev) => ({
      ...prev,
      items: updateMap(prev.items),
    }));
  };

  const handleRemoveItem = (index) => {
    setItemPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bagName.trim()) {
      toast.error("Bag name is required");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Items are required", {
        description: "Please add at least one torso design.",
      });
      return;
    }

    const payload = {
      ...formData,
      bagName: formData.bagName.trim(),
      items: formData.items.map((item) => ({
        image: item.url.startsWith("data:") ? item.url : item.image,
        quantity: item.quantity === "" ? 1 : Number(item.quantity),
      })),
    };

    try {
      if (dialogMode === "add") {
        const response = await createBag(payload).unwrap();
        if (response.success) {
          toast.success(response.message || "Torso bag created successfully", {
            description:
              response.description ||
              `The bag "${response.torsoBag?.bagName}" has been created.`,
          });
          handleDialogClose(false);
        }
      } else {
        const response = await updateBag({
          id: selectedBag._id,
          ...payload,
        }).unwrap();
        if (response.success) {
          toast.success(response.message || "Torso bag updated successfully", {
            description:
              response.description ||
              `The bag "${response.torsoBag?.bagName}" has been updated.`,
          });
          handleDialogClose(false);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save torso bag", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBag) return;
    try {
      const response = await deleteBag(selectedBag._id).unwrap();
      if (response.success) {
        toast.success(response.message || "Torso bag deleted successfully", {
          description:
            response.description || "The torso bag has been removed.",
        });
        setDeleteDialogOpen(false);
        setSelectedBag(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete torso bag", {
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
    itemPreviews,
    formData,
    bags,
    totalItems,
    totalPages,
    columns,
    minRequired,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    currentTotal,
    fileInputRef,

    // Handlers
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleItemImageChange,
    handleUpdateItemQuantity,
    handleRemoveItem,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  };
};

export default useDealerTorsoBagManagement;
