import { useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  useGetDealerTorsoBagsQuery,
  useCreateDealerTorsoBagMutation,
  useUpdateDealerTorsoBagMutation,
  useDeleteDealerTorsoBagMutation,
  useGetDealerBundlesQuery,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  bagName: "",
  isActive: true,
  items: [],
};

const useDealerTorsoBagManagement = () => {
  const [itemPreviews, setItemPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const resetImages = useCallback(() => {
    setItemPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const [createBag, { isLoading: isCreating }] =
    useCreateDealerTorsoBagMutation();
  const [updateBag, { isLoading: isUpdating }] =
    useUpdateDealerTorsoBagMutation();
  const [deleteBag, { isLoading: isDeleting }] =
    useDeleteDealerTorsoBagMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createBag,
    updateFn: updateBag,
    deleteFn: deleteBag,
    entityName: "torso bag",
    onReset: resetImages,
  });

  // Fetch data
  const { data, isLoading, isFetching } = useGetDealerTorsoBagsQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const { data: bundlesData } = useGetDealerBundlesQuery({ limit: 100 });
  const bundles = bundlesData?.bundles || [];

  const {
    items: bags,
    totalItems,
    totalPages,
  } = extractPaginatedData(data, "bags");

  // Derived State & Calculations
  const minRequired = useMemo(() => {
    if (!bundles || bundles.length === 0) return 100;
    const activeBundles = bundles.filter((b) => b.isActive);
    if (activeBundles.length === 0) return 100;
    return Math.min(...activeBundles.map((b) => b.minifigQuantity));
  }, [bundles]);

  const currentTotal = useMemo(() => {
    return crud.formData.items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 1),
      0,
    );
  }, [crud.formData.items]);

  const columns = [
    { label: "Bag Name", key: "bagName" },
    { label: "Designs Inside", key: "itemCount" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
  ];

  const handleEdit = (bag) => {
    const existingItems =
      bag.items?.map((item) => ({
        url: item.image?.url,
        quantity: item.quantity,
        image: item.image,
      })) || [];

    setItemPreviews(existingItems);
    crud.openEdit(bag, {
      bagName: bag.bagName,
      isActive: bag.isActive,
      items: existingItems,
    });
  };

  const handleItemImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let tempTotal = currentTotal;
    let skippedCount = 0;

    files.forEach((file) => {
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
        crud.setFormData((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      };
      reader.readAsDataURL(file);
      tempTotal += 1;
    });

    if (skippedCount > 0) {
      toast.warning(`Limit reached: ${skippedCount} designs were skipped`, {
        description: `Your allocation target is ${minRequired} designs max.`,
      });
    }
  };

  const handleUpdateItemQuantity = (index, value) => {
    const cleaned = value.toString().replace(/[^0-9]/g, "");

    // Empty input (user clearing) — allow temporarily, will use 1 on submit
    if (cleaned === "") {
      const updateMap = (items) =>
        items.map((item, i) =>
          i === index ? { ...item, quantity: "" } : item,
        );
      setItemPreviews((prev) => updateMap(prev));
      crud.setFormData((prev) => ({ ...prev, items: updateMap(prev.items) }));
      return;
    }

    const newValue = parseInt(cleaned, 10);

    // Per-item limit: quantity must be 1–4
    if (newValue > 4) {
      toast.error("Quantity must be 1–4", {
        description: "Each design can have a maximum of 4 quantity.",
      });
      return;
    }

    if (newValue < 1) return;

    // Total allocation check
    const otherItemsTotal = crud.formData.items.reduce(
      (acc, item, i) =>
        i === index ? acc : acc + (Number(item.quantity) || 1),
      0,
    );

    if (otherItemsTotal + newValue > minRequired) {
      toast.error("Allocation limit reached", {
        description: `Total quantity cannot exceed ${minRequired}.`,
      });
      return;
    }

    const updateMap = (items) =>
      items.map((item, i) =>
        i === index ? { ...item, quantity: newValue } : item,
      );

    setItemPreviews((prev) => updateMap(prev));
    crud.setFormData((prev) => ({ ...prev, items: updateMap(prev.items) }));
  };

  const handleRemoveItem = (index) => {
    setItemPreviews((prev) => prev.filter((_, i) => i !== index));
    crud.setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.bagName.trim()) {
      toast.error("Bag name is required");
      return;
    }

    if (crud.formData.items.length === 0) {
      toast.error("Items are required", {
        description: "Please add at least one torso design.",
      });
      return;
    }

    // Validate each item quantity is 1–4
    const invalidQuantity = crud.formData.items.find((item) => {
      const qty = Number(item.quantity) || 1;
      return qty < 1 || qty > 4;
    });
    if (invalidQuantity) {
      toast.error("Invalid quantity", {
        description: "Each design must have a quantity between 1 and 4.",
      });
      return;
    }

    await crud.submitForm({
      ...crud.formData,
      bagName: crud.formData.bagName.trim(),
      items: crud.formData.items.map((item) => ({
        image: item.url.startsWith("data:") ? item.url : item.image,
        quantity: item.quantity === "" ? 1 : Number(item.quantity),
      })),
    });
  };

  return {
    // State
    search: crud.search,
    limit: crud.limit,
    page: crud.page,
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    dialogMode: crud.dialogMode,
    selectedBag: crud.selectedItem,
    itemPreviews,
    formData: crud.formData,
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
    handleDialogClose: crud.handleDialogClose,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
    setFormData: crud.setFormData,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleItemImageChange,
    handleUpdateItemQuantity,
    handleRemoveItem,
    handleSubmit,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
  };
};

export default useDealerTorsoBagManagement;
