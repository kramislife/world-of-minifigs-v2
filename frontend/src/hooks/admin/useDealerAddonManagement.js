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
import { sanitizeString } from "@/utils/formatting";
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

// Factory for new preview metadata
const makeNewPreview = (url) => ({
  url,
  itemName: "",
  itemPrice: "",
  color: "",
  image: { url },
});

const useDealerAddonManagement = () => {
  // ------------------------------- Media ------------------------------------
  const {
    filePreview: filePreviews,
    setFilePreview: setFilePreviews,
    fileInputRef,
    resetFile,
    handleFileChange: onFileChange,
    handleRemoveFile,
  } = useMediaPreview({ multiple: true });

  // ------------------------------- Mutations ------------------------------------
  const [createAddon, { isLoading: isCreating }] =
    useCreateDealerAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] =
    useUpdateDealerAddonMutation();
  const [deleteAddon, { isLoading: isDeleting }] =
    useDeleteDealerAddonMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createAddon,
    updateFn: updateAddon,
    deleteFn: deleteAddon,
    entityName: "add-on",
    onReset: resetFile,
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: addonsResponse, isLoading: isLoadingAddons } =
    useGetDealerAddonsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: colorData } = useGetColorsQuery();

  const {
    items: addons,
    totalItems,
    totalPages,
  } = extractPaginatedData(addonsResponse, "addons");

  const colors = colorData?.colors
    ? [...colorData.colors].sort((a, b) =>
        (a.colorName || "").localeCompare(b.colorName || ""),
      )
    : [];

  // ------------------------------- Effects ------------------------------------
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  // ------------------------------- Submit Mode ------------------------------------
  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
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
      addonName: addon.addonName || "",
      price: addon.price || "",
      description: addon.description || "",
      isActive: addon.isActive !== false,
    });
  };

  // ------------------------------- File Handlers ------------------------------------
  const handleFileChange = useCallback(
    (e) => onFileChange(e, { mapFile: makeNewPreview }),
    [onFileChange],
  );

  const handleUpdateFileMetadata = useCallback(
    (index, field) => (e) => {
      const value = e?.target ? e.target.value : e;
      setFilePreviews((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [setFilePreviews],
  );

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateDealerAddon(crud.formData)) return;

    const previews = Array.isArray(filePreviews) ? filePreviews : [];

    const payload = {
      addonName: sanitizeString(crud.formData.addonName),
      price: Number(crud.formData.price || 0),
      description: sanitizeString(crud.formData.description),
      isActive: crud.formData.isActive,
      items: previews.map((item) => ({
        itemName: sanitizeString(item.itemName),
        itemPrice: Number(item.itemPrice || 0),
        ...(item.color && { color: item.color }),
        image:
          typeof item.url === "string" && item.url.startsWith("data:")
            ? item.url
            : item.image,
      })),
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

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
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
    handleEdit,
    handleFileChange,
    handleUpdateFileMetadata,
    handleRemoveFile,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useDealerAddonManagement;
