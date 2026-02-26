import { useCallback, useEffect } from "react";
import {
  useGetDealerAddonsQuery,
  useCreateDealerAddonMutation,
  useUpdateDealerAddonMutation,
  useDeleteDealerAddonMutation,
  useGetColorsQuery,
} from "@/redux/api/adminApi";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString, sanitizePayload } from "@/utils/formatting";
import { validateDealerAddon } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  addonName: "",
  price: "",
  description: "",
  isActive: true,
};

const columns = [
  { key: "addonName", label: "Add-on" },
  { key: "description", label: "Description" },
  { key: "price", label: "Price" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

// Factory to build a rich metadata preview object from a new dataUrl
const makeNewPreview = (url) => ({
  url,
  itemName: "",
  itemPrice: "",
  color: "",
  image: { url },
});

const useDealerAddonManagement = () => {
  const {
    filePreview: filePreviews,
    setFilePreview: setFilePreviews,
    fileInputRef,
    resetFile,
    handleFileChange: onFileChange,
    handleRemoveFile: handleRemoveFile,
  } = useMediaPreview({
    multiple: true,
  });

  const [createAddon, { isLoading: isCreating }] =
    useCreateDealerAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] =
    useUpdateDealerAddonMutation();
  const [deleteAddon, { isLoading: isDeleting }] =
    useDeleteDealerAddonMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createAddon,
    updateFn: updateAddon,
    deleteFn: deleteAddon,
    entityName: "add-on",
    onReset: resetFile,
  });

  // Fetch data
  const { data: addonsResponse, isLoading: isLoadingAddons } =
    useGetDealerAddonsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: colorData } = useGetColorsQuery();
  const colors = colorData?.colors
    ? [...colorData.colors].sort((a, b) =>
        (a.colorName || "").localeCompare(b.colorName || ""),
      )
    : [];

  const {
    items: addons,
    totalItems,
    totalPages,
  } = extractPaginatedData(addonsResponse, "addons");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (addon) => {
    const existingItems =
      addon.items?.map((item) => ({
        url: item.image?.url,
        itemName: item.itemName || "",
        itemPrice: item.itemPrice || "",
        color: item.color?._id || item.color || "",
        image: item.image,
      })) || [];

    setFilePreviews(existingItems);
    crud.openEdit(addon, {
      addonName: addon.addonName,
      price: addon.price || "",
      description: addon.description || "",
      isActive: addon.isActive,
    });
  };

  // Delegate to useMediaPreview with mapFile to produce rich metadata objects
  const handleFileChange = useCallback(
    (e) => onFileChange(e, { mapFile: makeNewPreview }),
    [onFileChange],
  );

  const handleUpdateFileMetadata = useCallback(
    (index, field, value) => {
      setFilePreviews((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [setFilePreviews],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDealerAddon(crud.formData)) return;

    const previews = Array.isArray(filePreviews) ? filePreviews : [];

    const payload = sanitizePayload({
      addonName: crud.formData.addonName,
      price: crud.formData.price || 0,
      description: crud.formData.description,
      isActive: crud.formData.isActive,
      items: previews.map((item) => ({
        itemName: sanitizeString(item.itemName),
        itemPrice: item.itemPrice || 0,
        color: item.color || undefined,
        image:
          typeof item.url === "string" && item.url.startsWith("data:")
            ? item.url
            : item.image,
      })),
    });

    await crud.submitForm(payload);
  };

  return {
    ...crud,
    selectedAddon: crud.selectedItem,
    filePreviews: Array.isArray(filePreviews) ? filePreviews : [],
    addons,
    totalItems,
    totalPages,
    columns,
    isLoadingAddons,
    isSubmitting,
    isDeleting,
    fileInputRef,
    colors,

    // Handlers
    handleEdit,
    handleFileChange,
    handleUpdateFileMetadata,
    handleRemoveFile,
    handleSubmit,
  };
};

export default useDealerAddonManagement;
