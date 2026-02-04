import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useGetDealerAddonsQuery,
  useCreateDealerAddonMutation,
  useUpdateDealerAddonMutation,
  useDeleteDealerAddonMutation,
} from "@/redux/api/adminApi";

const useDealerAddonManagement = () => {
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedAddon, setSelectedAddon] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    addonName: "",
    price: "",
    description: "",
    isActive: true,
    items: [],
  });

  // Image Preview State
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  // API Hooks
  const { data, isLoading, isFetching } = useGetDealerAddonsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [createAddon, { isLoading: isCreating }] =
    useCreateDealerAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] =
    useUpdateDealerAddonMutation();
  const [deleteAddon, { isLoading: isDeleting }] =
    useDeleteDealerAddonMutation();

  const addons = data?.addons || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  const columns = [
    { label: "Add-on", key: "addonName" },
    { label: "Description", key: "description" },
    { label: "Price", key: "price" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
  ];

  // Handlers
  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
        addonName: "",
        price: "",
        description: "",
        isActive: true,
        items: [],
      });
      setImagePreviews([]);
      setSelectedAddon(null);
      setDialogMode("add");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedAddon(null);
    setImagePreviews([]);
    setFormData({
      addonName: "",
      price: "",
      description: "",
      isActive: true,
      items: [],
    });
    setDialogOpen(true);
  };

  const handleEdit = (addon) => {
    setDialogMode("edit");
    setSelectedAddon(addon);

    const existingItems =
      addon.items?.map((item) => ({
        url: item.image?.url,
        itemName: item.itemName || "",
        itemPrice: item.itemPrice || "",
        image: item.image,
      })) || [];

    setImagePreviews(existingItems);

    setFormData({
      addonName: addon.addonName,
      price: addon.price,
      description: addon.description,
      isActive: addon.isActive,
      items: existingItems,
    });
    setDialogOpen(true);
  };

  const handleDelete = (addon) => {
    setSelectedAddon(addon);
    setDeleteDialogOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image "${file.name}" is too large`, {
          description: "Images must be less than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImageData = {
          url: reader.result,
          itemPrice: "",
          itemName: "",
        };
        setImagePreviews((prev) => [...prev, newImageData]);
        setFormData((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            { image: reader.result, itemPrice: "", itemName: "" },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateImageMetadata = (index, field, value) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    );
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((img, i) =>
        i === index ? { ...img, [field]: value } : img,
      ),
    }));
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.addonName.trim()) {
      toast.error("Add-on name is required");
      return;
    }

    const payload = {
      ...formData,
      price: formData.price ? Number(formData.price) : undefined,
    };

    try {
      if (dialogMode === "add") {
        const response = await createAddon(payload).unwrap();
        if (response.success) {
          toast.success(response.message || "Add-on created successfully", {
            description:
              response.description ||
              `The add-on "${response.addon.addonName}" has been added.`,
          });
          handleDialogClose(false);
        }
      } else {
        const response = await updateAddon({
          id: selectedAddon._id,
          ...payload,
        }).unwrap();
        if (response.success) {
          toast.success(response.message || "Add-on updated successfully", {
            description:
              response.description ||
              `The add-on "${response.addon.addonName}" has been updated.`,
          });
          handleDialogClose(false);
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save add-on", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAddon) return;
    try {
      const response = await deleteAddon(selectedAddon._id).unwrap();
      if (response.success) {
        toast.success(response.message || "Add-on deleted successfully", {
          description: response.description || "The add-on has been removed.",
        });
        setDeleteDialogOpen(false);
        setSelectedAddon(null);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete add-on", {
        description:
          err?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (p) => setPage(p);
  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
  };
  const handleSearchChange = (s) => {
    setSearch(s);
    setPage(1);
  };

  return {
    // State
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedAddon,
    imagePreviews,
    formData,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    fileInputRef,

    // Handlers
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    setImagePreviews,
    handleAdd,
    handleEdit,
    handleDelete,
    handleImageChange,
    handleUpdateImageMetadata,
    handleRemoveImage,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  };
};

export default useDealerAddonManagement;
