import { useEffect } from "react";
import {
  useGetDealerAddonsQuery,
  useCreateDealerAddonMutation,
  useUpdateDealerAddonMutation,
  useDeleteDealerAddonMutation,
  useGetColorsQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
import { validateDealerAddon } from "@/utils/validation";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
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

// Factory for preview item
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
    filePreview,
    setFilePreview,
    fileInputRef,
    resetFile,
    handleFileChange,
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
  const { data: addonsData, isLoading: isLoadingAddons } =
    useGetDealerAddonsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: colorData, isLoading: isLoadingColors } = useGetColorsQuery();

  const {
    items: addons,
    totalItems,
    totalPages,
  } = extractPaginatedData(addonsData, "addons");

  const colors = [...(colorData?.colors || [])].sort((a, b) =>
    (a.colorName || "").localeCompare(b.colorName || ""),
  );

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- File Handlers ------------------------------------
  const handleDealerAddonFileChange = async (e) => {
    await handleFileChange(e, { mapFile: makeNewPreview });
  };

  const handleDealerAddonFileRemove = (index) => {
    handleRemoveFile(index);
  };

  const handleUpdateFileMetadata = (index, field) => (e) => {
    const value = e?.target ? e.target.value : e;

    setFilePreview((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

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

    setFilePreview(existingItems);

    crud.openEdit(addon, {
      addonName: addon.addonName || "",
      price: addon.price || "",
      description: addon.description || "",
      isActive: addon.isActive !== false,
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateDealerAddon(crud.formData)) return;

    const payload = {
      addonName: sanitizeString(crud.formData.addonName),
      price: Number(crud.formData.price || 0),
      description: sanitizeString(crud.formData.description),
      isActive: crud.formData.isActive,
      items: filePreview.map((item) => ({
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

  // ------------------------------- Standard Handlers ------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    crud.setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleValueChange = (field) => (value) => {
    crud.setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    filePreview,
    fileInputRef,
    addons,
    totalItems,
    totalPages,
    columns,
    colors,
    isLoadingAddons,
    isLoadingColors,
    isSubmitting,
    isDeleting,
    handleDealerAddonFileChange,
    handleDealerAddonFileRemove,
    handleUpdateFileMetadata,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useDealerAddonManagement;
