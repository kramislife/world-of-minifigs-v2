import { useEffect } from "react";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString, sanitizeOptional } from "@/utils/formatting";
import { validateBanner } from "@/utils/validation";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  badge: "",
  label: "",
  description: "",
  position: "center",
  textTheme: "light",
  media: null,
  mediaType: "image",
  enableButtons: false,
  buttons: [
    { label: "", href: "", variant: "default" },
    { label: "", href: "", variant: "default" },
  ],
  isActive: true,
  order: 1,
};

const columns = [
  { key: "badge", label: "Badge" },
  { key: "label", label: "Label" },
  { key: "order", label: "Order" },
  { key: "position", label: "Position" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useBannerManagement = () => {
  // ---------------------------- Media ----------------------------
  const {
    filePreview,
    setFilePreview,
    fileInputRef,
    resetFile,
    handleFileChange,
    handleRemoveFile,
  } = useMediaPreview({ allowVideo: true, maxSizeMB: 10 });

  // ---------------------------- Mutations ----------------------------
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  // ---------------------------- Core CRUD ----------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createBanner,
    updateFn: updateBanner,
    deleteFn: deleteBanner,
    entityName: "banner",
    onReset: resetFile,
  });

  // ---------------------------- Fetch ----------------------------
  const { data: bannersData, isLoading: isLoadingBanners } = useGetBannersQuery(
    {
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    },
  );

  const {
    items: banners,
    totalItems,
    totalPages,
  } = extractPaginatedData(bannersData, "banners");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ---------------------------- Media Handlers ----------------------------
  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const dataUrl = await handleFileChange(e);

    if (dataUrl) {
      crud.setFormData((prev) => ({
        ...prev,
        media: dataUrl,
        mediaType,
      }));
    }
  };

  const handleBannerFileRemove = () => {
    handleRemoveFile();
    crud.setFormData((prev) => ({
      ...prev,
      media: null,
    }));
  };

  // ---------------------------- Add Handler ----------------------------
  const handleAdd = () => {
    const maxOrder =
      banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) : 0;

    crud.handleAdd({ order: maxOrder + 1 });
  };

  // ---------------------------- Edit Handler ----------------------------
  const handleEdit = (banner) => {
    crud.openEdit(banner, {
      badge: banner.badge || "",
      label: banner.label || "",
      description: banner.description || "",
      position: banner.position || "center",
      textTheme: banner.textTheme || "light",
      media: null,
      mediaType: banner.media?.resourceType || "image",
      enableButtons: banner.enableButtons || false,
      buttons:
        banner.buttons?.length > 0
          ? banner.buttons.slice(0, 2).map((btn) => ({
              label: btn.label || "",
              href: btn.href || "",
              variant: btn.variant || "default",
            }))
          : [
              { label: "", href: "", variant: "default" },
              { label: "", href: "", variant: "default" },
            ],
      isActive: banner.isActive !== false,
      order: banner.order || 1,
    });

    setFilePreview(banner.media?.url || null);
  };

  // ---------------------------- Submit Handler ----------------------------
  const handleSubmit = async () => {
    if (!validateBanner(crud.formData, crud.dialogMode)) return;

    const buttons = crud.formData.enableButtons
      ? crud.formData.buttons
          .filter((b) => sanitizeString(b.label) && sanitizeString(b.href))
          .map((b) => ({
            label: sanitizeString(b.label),
            href: sanitizeString(b.href),
            variant: b.variant || "default",
          }))
          .slice(0, 2)
      : null;

    const payload = {
      badge: sanitizeOptional(crud.formData.badge),
      label: sanitizeString(crud.formData.label),
      description: sanitizeString(crud.formData.description),
      position: crud.formData.position,
      textTheme: crud.formData.textTheme,
      enableButtons: crud.formData.enableButtons,
      isActive: crud.formData.isActive,
      order: crud.formData.order,
      ...(buttons?.length && { buttons }),
      ...(crud.formData.media && { media: crud.formData.media }),
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
    crud.setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (arrayName, index, field) => (e) => {
    const value = e?.target
      ? e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value
      : e;

    crud.setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = {
        ...newArray[index],
        [field]: value,
      };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // ---------------------------- Return ----------------------------
  return {
    ...crud,
    filePreview,
    fileInputRef,
    banners,
    totalItems,
    totalPages,
    columns,
    isLoadingBanners,
    isSubmitting,
    isDeleting,
    handleBannerFileChange,
    handleBannerFileRemove,
    handleSubmit,
    handleAdd,
    handleEdit,
    handleChange,
    handleValueChange,
    handleNestedChange,
  };
};

export default useBannerManagement;
