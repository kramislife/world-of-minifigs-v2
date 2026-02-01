import { useState } from "react";
import { toast } from "sonner";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from "@/redux/api/adminApi";

const useBannerManagement = () => {
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");

  // Form state
  const [formData, setFormData] = useState({
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
  });

  const [mediaPreview, setMediaPreview] = useState("");

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data
  const { data: bannersData, isLoading: isLoadingBanners } = useGetBannersQuery(
    {
      page,
      limit,
      search: search || undefined,
    },
  );

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  // Extract banners
  const banners = bannersData?.banners || [];
  const totalItems = bannersData?.pagination?.totalItems || banners.length;
  const totalPages = bannersData?.pagination?.totalPages || 1;

  // Column definitions
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

  // Core handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    // Handle nested button fields
    if (name === "buttons") {
      const { index, field, value: v } = value;
      setFormData((prev) => {
        const nextButtons = [...prev.buttons];
        nextButtons[index] = { ...nextButtons[index], [field]: v };
        return { ...prev, buttons: nextButtons };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Media file must be less than 10MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        media: reader.result,
        mediaType: file.type.startsWith("video") ? "video" : "image",
      }));
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setFormData((prev) => ({ ...prev, media: null }));
    setMediaPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      toast.error("Label is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (dialogMode === "add" && !formData.media) {
      toast.error("Banner media is required");
      return;
    }

    const payload = {
      badge: formData.badge?.trim() || undefined,
      label: formData.label.trim(),
      description: formData.description.trim(),
      position: formData.position,
      textTheme: formData.textTheme,
      enableButtons: formData.enableButtons,
      isActive: formData.isActive,
      order: formData.order,
    };

    if (formData.enableButtons) {
      payload.buttons = formData.buttons
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

    if (formData.media) {
      payload.media = formData.media;
    }

    try {
      if (dialogMode === "edit" && selectedBanner) {
        const response = await updateBanner({
          id: selectedBanner._id,
          ...payload,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Banner updated", {
            description:
              response.description ||
              `The banner "${response.banner.label}" has been updated.`,
          });
          handleDialogClose(false);
        }
      } else {
        const response = await createBanner(payload).unwrap();

        if (response.success) {
          toast.success(response.message || "Banner created", {
            description:
              response.description ||
              `The banner "${response.banner.label}" has been added.`,
          });
          handleDialogClose(false);
        }
      }
    } catch (err) {
      console.error("Banner save error:", err);
      toast.error(err?.data?.message || "Failed to save banner", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
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
      });
      setMediaPreview("");
      setSelectedBanner(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    const maxOrder =
      banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) : 0;
    const nextOrder = maxOrder + 1;

    setDialogMode("add");
    setSelectedBanner(null);
    setFormData((prev) => ({
      ...prev,
      order: nextOrder,
    }));
    handleDialogClose(true);
  };

  const handleEdit = (banner) => {
    setDialogMode("edit");
    setSelectedBanner(banner);

    setFormData({
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
    setDialogOpen(true);
  };

  const handleDelete = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;

    try {
      const response = await deleteBanner(selectedBanner._id).unwrap();
      if (response.success) {
        toast.success(response.message || "Banner deleted", {
          description:
            response.description ||
            `The banner "${selectedBanner.label}" has been removed.`,
        });
        setDeleteDialogOpen(false);
        setSelectedBanner(null);
      }
    } catch (err) {
      console.error("Delete banner error:", err);
      toast.error(err?.data?.message || "Delete failed", {
        description: err?.data?.description || "An unexpected error occurred.",
      });
    }
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return {
    // State
    dialogOpen,
    deleteDialogOpen,
    selectedBanner,
    dialogMode,
    formData,
    mediaPreview,
    page,
    limit,
    search,
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
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    setDeleteDialogOpen,
    setFormData,
  };
};

export default useBannerManagement;
