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
  // ---------------------------- Media Hook ----------------------------
  const {
    filePreview: mediaPreview,
    setFilePreview: setMediaPreview,
    resetFile: resetMedia,
    handleFileChange: onMediaChange,
    handleRemoveFile: onRemoveMedia,
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
    onReset: resetMedia,
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

  // ---------------------------- Submit Mode ----------------------------
  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ---------------------------- Media Handlers ----------------------------
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const dataUrl = await onMediaChange(e);

    if (dataUrl) {
      crud.setFormData((prev) => ({
        ...prev,
        media: dataUrl,
        mediaType,
      }));
    }
  };

  const handleRemoveFile = () => {
    onRemoveMedia();
    crud.setFormData((prev) => ({ ...prev, media: null }));
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

    setMediaPreview(banner.media?.url || "");
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
    crud.setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (arrayName, index, field) => (e) => {
    const value = e?.target
      ? e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value
      : e;
    crud.setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // ---------------------------- Layout Helpers ----------------------------
  const isDarkTheme = crud.formData.textTheme === "dark";
  const isLightTheme = crud.formData.textTheme === "light";

  const getPositionClasses = (position) => {
    switch (position) {
      case "bottom-left":
        return {
          container: "items-end justify-start text-left",
          buttons: "justify-start",
        };
      case "bottom-right":
        return {
          container: "items-end justify-end text-right",
          buttons: "justify-end",
        };
      default:
        return {
          container: "items-center justify-center text-center",
          buttons: "justify-center",
        };
    }
  };

  const layoutClasses = getPositionClasses(crud.formData.position);

  const getButtonStyle = (btn) => {
    if (btn.variant === "outline") return "border";
    return isDarkTheme
      ? "bg-black border-black text-white"
      : "bg-white border-white text-black";
  };

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    mediaPreview,
    banners,
    totalItems,
    totalPages,
    columns,
    isLoadingBanners,
    isSubmitting,
    isDeleting,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
    handleAdd,
    handleEdit,
    handleChange,
    handleValueChange,
    handleNestedChange,
    isDarkTheme,
    isLightTheme,
    layoutClasses,
    getButtonStyle,
  };
};

export default useBannerManagement;
