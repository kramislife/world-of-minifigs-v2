import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { validateFile, readFileAsDataURL } from "@/utils/fileHelpers";

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

const useBannerManagement = () => {
  const [mediaPreview, setMediaPreview] = useState("");

  const resetMedia = useCallback(() => {
    setMediaPreview("");
  }, []);

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
  const { data: bannersData, isLoading: isLoadingBanners } =
    useGetBannersQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { items: banners, totalItems, totalPages } =
    extractPaginatedData(bannersData, "banners");

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    crud.setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleMediaChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, { maxSizeMB: 10, allowVideo: true }))
      return;

    const dataUrl = await readFileAsDataURL(file);
    crud.setFormData((prev) => ({
      ...prev,
      media: dataUrl,
      mediaType: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaPreview(dataUrl);
  };

  const handleRemoveMedia = () => {
    crud.setFormData((prev) => ({ ...prev, media: null }));
    setMediaPreview("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.label.trim()) {
      toast.error("Label is required");
      return;
    }

    if (!crud.formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (crud.dialogMode === "add" && !crud.formData.media) {
      toast.error("Banner media is required");
      return;
    }

    const payload = {
      badge: crud.formData.badge?.trim() || undefined,
      label: crud.formData.label.trim(),
      description: crud.formData.description.trim(),
      position: crud.formData.position,
      textTheme: crud.formData.textTheme,
      enableButtons: crud.formData.enableButtons,
      isActive: crud.formData.isActive,
      order: crud.formData.order,
    };

    if (crud.formData.enableButtons) {
      payload.buttons = crud.formData.buttons
        .filter((b) => b.label.trim() && b.href.trim())
        .map((b) => ({
          label: b.label.trim(),
          href: b.href.trim(),
          variant: b.variant || "default",
        }))
        .slice(0, 2);

      if (payload.buttons.length === 0) {
        toast.error("Button configuration incomplete", {
          description:
            "Please provide both label and link for enabled buttons.",
        });
        return;
      }
    }

    if (crud.formData.media) {
      payload.media = crud.formData.media;
    }

    await crud.submitForm(payload);
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedBanner: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    mediaPreview,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    banners,
    totalItems,
    totalPages,
    columns,
    isLoadingBanners,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleChange,
    handleSelectChange,
    handleMediaChange,
    handleRemoveMedia,
    handleSubmit,
    handleDialogClose: crud.handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
    setFormData: crud.setFormData,
  };
};

export default useBannerManagement;
