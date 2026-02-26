import { useMemo, useCallback, useEffect } from "react";
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
  const {
    filePreview: itemPreviews,
    setFilePreview: setItemPreviews,
    fileInputRef,
    resetFile,
    handleFileChange: onFileChange,
  } = useMediaPreview({ multiple: true });

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
    onReset: resetFile,
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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  // Build target options from active bundles
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

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (bag) => {
    const existingItems =
      bag.items?.map((item) => ({
        url: item.image?.url,
        quantity: item.quantity,
        image: item.image,
      })) || [];

    setItemPreviews(existingItems.map((item) => item.url));
    crud.openEdit(bag, {
      bagName: bag.bagName,
      targetBundleSize: bag.targetBundleSize || 100,
      isActive: bag.isActive,
      items: existingItems,
    });
  };

  // Custom file handler — uses shared validation but has domain-specific quantity limits
  const handleFileChange = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      let tempTotal = currentTotal;
      let skippedCount = 0;

      // Validate and read files, respecting quantity allocation limits
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

      if (validFiles.length === 0) return;

      const dataUrls = await Promise.all(validFiles.map(readFileAsDataURL));

      setItemPreviews((prev) => [...prev, ...dataUrls]);

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
    [
      currentTotal,
      adminTarget,
      targetSize,
      miscQuantity,
      crud,
      setItemPreviews,
    ],
  );

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

    if (!validateTorsoAllocation(otherItemsTotal, newValue, adminTarget))
      return;

    const updateMap = (items) =>
      items.map((item, i) =>
        i === index ? { ...item, quantity: newValue } : item,
      );

    setItemPreviews((prev) => updateMap(prev));
    crud.setFormData((prev) => ({ ...prev, items: updateMap(prev.items) }));
  };

  const handleRemoveFile = useCallback(
    (index) => {
      setItemPreviews((prev) => prev.filter((_, i) => i !== index));
      crud.setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [crud, setItemPreviews],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      quantity: item.quantity === "" ? 1 : Number(item.quantity),
    }));

    await crud.submitForm({
      bagName: sanitizeString(crud.formData.bagName),
      targetBundleSize: targetSize,
      isActive: crud.formData.isActive,
      items,
    });
  };

  return {
    ...crud,
    filePreviews: itemPreviews,
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

    // Handlers
    handleEdit,
    handleFileChange,
    handleUpdateItemQuantity,
    handleRemoveFile,
    handleSubmit,
  };
};

export default useDealerTorsoBagManagement;
