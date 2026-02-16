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

// Misc is always 20% of the target bundle size
const MISC_RATIO = 0.2;
const getMiscQuantity = (target) => Math.round(target * MISC_RATIO);
const getAdminTarget = (target) => target - getMiscQuantity(target);

const initialFormData = {
  bagName: "",
  targetBundleSize: 100,
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
  const { data: bagsResponse, isLoading: isLoadingBags } =
    useGetDealerTorsoBagsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  // Fetch bundles to build targetBundleSize options
  const { data: bundlesData } = useGetDealerBundlesQuery({ limit: 100 });
  const bundles = bundlesData?.bundles || [];

  const {
    items: bags,
    totalItems,
    totalPages,
  } = extractPaginatedData(bagsResponse, "bags");

  // Build target options from active bundles
  // Regular bundles use the base (smallest), custom bundles use their own size
  const targetBundleSizeOptions = useMemo(() => {
    if (!bundles.length) return [{ value: 100, label: "100 Minifigs (Base)" }];

    const activeBundles = bundles.filter((b) => b.isActive);
    const sizes = new Set();

    // Always include the base (smallest regular)
    const regularBundles = activeBundles.filter(
      (b) => (b.torsoBagType || "regular") === "regular",
    );
    if (regularBundles.length > 0) {
      const base = Math.min(...regularBundles.map((b) => b.minifigQuantity));
      sizes.add(base);
    }

    // Include custom bundle sizes
    activeBundles
      .filter((b) => b.torsoBagType === "custom")
      .forEach((b) => sizes.add(b.minifigQuantity));

    if (sizes.size === 0) sizes.add(100);

    return [...sizes]
      .sort((a, b) => a - b)
      .map((size) => ({
        value: size,
        label: `${size} Minifigs`,
      }));
  }, [bundles]);

  // Derived validation values
  const targetSize = Number(crud.formData.targetBundleSize) || 100;
  const miscQuantity = getMiscQuantity(targetSize);
  const adminTarget = getAdminTarget(targetSize);

  const currentTotal = useMemo(() => {
    return crud.formData.items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 1),
      0,
    );
  }, [crud.formData.items]);

  const columns = [
    { key: "bagName", label: "Bag Name" },
    { key: "targetBundleSize", label: "Target" },
    { key: "itemCount", label: "Designs Inside" },
    { key: "isActive", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
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
      targetBundleSize: bag.targetBundleSize || 100,
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
      if (tempTotal + 1 > adminTarget) {
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
        description: `Admin allocation target is ${adminTarget} (${targetSize} minus ${miscQuantity} miscellaneous).`,
      });
    }
  };

  const handleUpdateItemQuantity = (index, value) => {
    const cleaned = value.toString().replace(/[^0-9]/g, "");

    // Empty input — allow temporarily, will default to 1 on submit
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
    if (newValue < 1) return;

    // Total allocation check
    const otherItemsTotal = crud.formData.items.reduce(
      (acc, item, i) =>
        i === index ? acc : acc + (Number(item.quantity) || 1),
      0,
    );

    if (otherItemsTotal + newValue > adminTarget) {
      toast.error("Allocation limit reached", {
        description: `Total quantity cannot exceed ${adminTarget}.`,
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

    // Validate total matches admin target
    const submitTotal = crud.formData.items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 1),
      0,
    );

    if (submitTotal !== adminTarget) {
      toast.error("Quantity mismatch", {
        description: `Total must equal ${adminTarget} (${targetSize} minus ${miscQuantity} misc). Current: ${submitTotal}.`,
      });
      return;
    }

    const items = crud.formData.items.map((item) => ({
      image: typeof item?.url === "string" && item.url.startsWith("data:")
        ? item.url
        : item?.image,
      quantity: item.quantity === "" ? 1 : Number(item.quantity),
    }));

    await crud.submitForm({
      bagName: crud.formData.bagName.trim(),
      targetBundleSize: targetSize,
      isActive: crud.formData.isActive,
      items,
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedBag: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    itemPreviews,
    fileInputRef,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    bags,
    totalItems,
    totalPages,
    columns,
    targetBundleSizeOptions,
    adminTarget,
    miscQuantity,
    currentTotal,
    isLoadingBags,
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
