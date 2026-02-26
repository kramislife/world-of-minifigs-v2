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
  { key: "label", label: "Label" },
  { key: "badge", label: "Badge" },
  { key: "order", label: "Order" },
  { key: "position", label: "Position" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useBannerManagement = () => {
  const {
    filePreview: mediaPreview,
    setFilePreview: setMediaPreview,
    resetFile: resetMedia,
    handleFileChange: onMediaChange,
    handleRemoveFile: onRemoveMedia,
  } = useMediaPreview({ allowVideo: true, maxSizeMB: 10 });

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createBanner,
    updateFn: updateBanner,
    deleteFn: deleteBanner,
    entityName: "banner",
    onReset: resetMedia,
  });

  // Fetch data
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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleSelectChange = (name, value) => {
    // Handle nested button fields
    if (name === "buttons") {
      const { index, field, value: v } = value;
      crud.setFormData((prev) => {
        const nextButtons = [...prev.buttons];
        nextButtons[index] = { ...nextButtons[index], [field]: v };
        return { ...prev, buttons: nextButtons };
      });
      return;
    }

    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    // Detect mediaType before delegating to useMediaPreview
    const file = e.target.files?.[0];
    if (!file) return;
    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const dataUrl = await onMediaChange(e);
    if (dataUrl) {
      crud.setFormData((prev) => ({ ...prev, media: dataUrl, mediaType }));
    }
  };

  const handleRemoveFile = () => {
    onRemoveMedia();
    crud.setFormData((prev) => ({ ...prev, media: null }));
  };

  const handleAdd = () => {
    const maxOrder =
      banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) : 0;
    crud.handleAdd({ order: maxOrder + 1 });
  };

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
          ? [
              banner.buttons[0]
                ? {
                    label: banner.buttons[0].label,
                    href: banner.buttons[0].href,
                    variant: banner.buttons[0].variant || "default",
                  }
                : { label: "", href: "", variant: "default" },
              banner.buttons[1]
                ? {
                    label: banner.buttons[1].label,
                    href: banner.buttons[1].href,
                    variant: banner.buttons[1].variant || "default",
                  }
                : { label: "", href: "", variant: "default" },
            ]
          : [
              { label: "", href: "", variant: "default" },
              { label: "", href: "", variant: "default" },
            ],
      isActive: banner.isActive !== false,
      order: banner.order || 1,
    });
    setMediaPreview(banner.media?.url || "");
  };

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

    // Handlers
    handleSelectChange,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
    handleAdd,
    handleEdit,
  };
};

export default useBannerManagement;
