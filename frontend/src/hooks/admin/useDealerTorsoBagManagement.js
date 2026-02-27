import { useEffect, useMemo, useCallback } from "react";
import {
  useGetDealerTorsoBagsQuery,
  useCreateDealerTorsoBagMutation,
  useUpdateDealerTorsoBagMutation,
  useDeleteDealerTorsoBagMutation,
  useGetDealerBundlesQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
import {
  validateDealerTorsoBag,
  validateTorsoAllocation,
  showTorsoAllocationWarning,
} from "@/utils/validation";
import { validateFile, readFileAsDataURL } from "@/utils/fileHelpers";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const MISC_RATIO = 0.2;
const getMiscQuantity = (target) => Math.round(target * MISC_RATIO);
const getAdminTarget = (target) => target - getMiscQuantity(target);

const initialFormData = {
  bagName: "",
  targetBundleSize: 100,
  isActive: true,
  items: [],
};

const columns = [
  { key: "bagName", label: "Bag Name" },
  { key: "targetBundleSize", label: "Target" },
  { key: "itemCount", label: "Designs Inside" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useDealerTorsoBagManagement = () => {
  // ------------------------------- Media ------------------------------------
  const { filePreview, setFilePreview, fileInputRef, resetFile } =
    useMediaPreview({ multiple: true });

  // ------------------------------- Mutations ------------------------------------
  const [createBag, { isLoading: isCreating }] =
    useCreateDealerTorsoBagMutation();
  const [updateBag, { isLoading: isUpdating }] =
    useUpdateDealerTorsoBagMutation();
  const [deleteBag, { isLoading: isDeleting }] =
    useDeleteDealerTorsoBagMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createBag,
    updateFn: updateBag,
    deleteFn: deleteBag,
    entityName: "torso bag",
    onReset: resetFile,
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: bagsResponse, isLoading: isLoadingBags } =
    useGetDealerTorsoBagsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: bundlesData } = useGetDealerBundlesQuery({ limit: 100 });

  const {
    items: bags,
    totalItems,
    totalPages,
  } = extractPaginatedData(bagsResponse, "bags");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  // ------------------------------- Submit Mode ------------------------------------
  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Derived Values ------------------------------------
  const bundles = bundlesData?.bundles || [];

  const targetBundleSizeOptions = useMemo(() => {
    if (!bundles.length) return [{ value: 100, label: "100 Minifigs (Base)" }];

    const activeBundles = bundles.filter((b) => b.isActive);
    const sizes = new Set();

    const regularBundles = activeBundles.filter(
      (b) => (b.torsoBagType || "regular") === "regular",
    );

    if (regularBundles.length > 0) {
      const base = Math.min(...regularBundles.map((b) => b.minifigQuantity));
      sizes.add(base);
    }

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

  const targetSize = Number(crud.formData.targetBundleSize) || 100;
  const miscQuantity = getMiscQuantity(targetSize);
  const adminTarget = getAdminTarget(targetSize);

  const currentTotal = useMemo(() => {
    return crud.formData.items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 1),
      0,
    );
  }, [crud.formData.items]);

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (bag) => {
    const existingItems =
      bag.items?.map((item) => ({
        url: item.image?.url,
        quantity: item.quantity,
        image: item.image,
      })) || [];

    setFilePreview(existingItems.map((item) => item.url));

    crud.openEdit(bag, {
      bagName: bag.bagName || "",
      targetBundleSize: bag.targetBundleSize || 100,
      isActive: bag.isActive !== false,
      items: existingItems,
    });
  };

  // ------------------------------- Media Handlers ------------------------------------
  const handleFileChange = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      let tempTotal = currentTotal;
      let skippedCount = 0;
      const validFiles = [];

      for (const file of files) {
        if (tempTotal + 1 > adminTarget) {
          skippedCount++;
          continue;
        }

        if (!validateFile(file, { maxSizeMB: 5 })) continue;

        validFiles.push(file);
        tempTotal += 1;
      }

      showTorsoAllocationWarning(
        skippedCount,
        adminTarget,
        targetSize,
        miscQuantity,
      );

      if (!validFiles.length) return;

      const dataUrls = await Promise.all(validFiles.map(readFileAsDataURL));

      setFilePreview((prev) => [...prev, ...dataUrls]);

      const newItems = dataUrls.map((url) => ({
        url,
        quantity: 1,
        image: { url },
      }));

      crud.setFormData((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems],
      }));
    },
    [currentTotal, adminTarget, targetSize, miscQuantity],
  );

  const handleRemoveFile = useCallback(
    (index) => () => {
      setFilePreview((prev) => prev.filter((_, i) => i !== index));
      removeArrayItem("items", index)();
    },
    [setFilePreview],
  );

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (
      !validateDealerTorsoBag(
        crud.formData,
        adminTarget,
        targetSize,
        miscQuantity,
      )
    )
      return;

    const items = crud.formData.items.map((item) => ({
      image:
        typeof item?.url === "string" && item.url.startsWith("data:")
          ? item.url
          : item?.image,
      quantity:
        item.quantity === "" || item.quantity == null
          ? 1
          : Number(item.quantity),
    }));

    const payload = {
      bagName: sanitizeString(crud.formData.bagName),
      targetBundleSize: targetSize,
      isActive: crud.formData.isActive,
      items,
    };

    await crud.submitForm(payload);
  };

  // ------------------------------- Handlers ------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    crud.setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleValueChange = (field) => (value) => {
    crud.setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayName, index) => (e) => {
    const value = e?.target ? e.target.value : e;
    crud.setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const removeArrayItem = (arrayName, index) => () => {
    crud.setFormData((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateItemQuantity = (index) => (e) => {
    const value = e?.target ? e.target.value : e;
    const cleaned = value.toString().replace(/[^0-9]/g, "");
    if (!cleaned) return;

    const newValue = parseInt(cleaned, 10);
    if (newValue < 1) return;

    const otherItemsTotal = crud.formData.items.reduce(
      (acc, item, i) =>
        i === index ? acc : acc + (Number(item.quantity) || 1),
      0,
    );

    if (!validateTorsoAllocation(otherItemsTotal, newValue, adminTarget))
      return;

    handleArrayChange(
      "items",
      index,
    )({
      ...crud.formData.items[index],
      quantity: newValue,
    });
  };

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    filePreview,
    fileInputRef,
    bags,
    totalItems,
    totalPages,
    columns,
    targetBundleSizeOptions,
    adminTarget,
    miscQuantity,
    currentTotal,
    isLoadingBags,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleFileChange,
    handleRemoveFile,
    handleUpdateItemQuantity,
    handleSubmit,
    handleChange,
    handleValueChange,
    handleArrayChange,
    removeArrayItem,
  };
};

export default useDealerTorsoBagManagement;
