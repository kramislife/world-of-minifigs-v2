import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  useGetDealerAddonsQuery,
  useCreateDealerAddonMutation,
  useUpdateDealerAddonMutation,
  useDeleteDealerAddonMutation,
  useGetColorsQuery,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  addonName: "",
  price: "",
  description: "",
  isActive: true,
  items: [],
};

const useDealerAddonManagement = () => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const resetImages = useCallback(() => {
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

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
    onReset: resetImages,
  });

  // Fetch data
  const { data, isLoading, isFetching } = useGetDealerAddonsQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const { data: colorData } = useGetColorsQuery();
  const colors = colorData?.colors
    ? [...colorData.colors].sort((a, b) =>
        a.colorName.localeCompare(b.colorName),
      )
    : [];

  const {
    items: addons,
    totalItems,
    totalPages,
  } = extractPaginatedData(data, "addons");

  const columns = [
    { label: "Add-on", key: "addonName" },
    { label: "Description", key: "description" },
    { label: "Price", key: "price" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
  ];

  const handleEdit = (addon) => {
    const existingItems =
      addon.items?.map((item) => ({
        url: item.image?.url,
        itemName: item.itemName || "",
        itemPrice: item.itemPrice || "",
        color: item.color?._id || item.color || "",
        image: item.image,
      })) || [];

    setImagePreviews(existingItems);

    crud.openEdit(addon, {
      addonName: addon.addonName,
      price: addon.price,
      description: addon.description,
      isActive: addon.isActive,
      items: existingItems,
    });
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
          color: "",
        };
        setImagePreviews((prev) => [...prev, newImageData]);
        crud.setFormData((prev) => ({
          ...prev,
          items: [
            ...prev.items,
            {
              image: reader.result,
              itemPrice: "",
              itemName: "",
              color: "",
            },
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
    crud.setFormData((prev) => ({
      ...prev,
      items: prev.items.map((img, i) =>
        i === index ? { ...img, [field]: value } : img,
      ),
    }));
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    crud.setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.addonName.trim()) {
      toast.error("Add-on name is required");
      return;
    }

    await crud.submitForm({
      ...crud.formData,
      price: crud.formData.price ? Number(crud.formData.price) : undefined,
    });
  };

  return {
    // State
    search: crud.search,
    limit: crud.limit,
    page: crud.page,
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    dialogMode: crud.dialogMode,
    selectedAddon: crud.selectedItem,
    imagePreviews,
    formData: crud.formData,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    fileInputRef,
    colors,

    // Handlers
    handleDialogClose: crud.handleDialogClose,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
    setFormData: crud.setFormData,
    setImagePreviews,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleImageChange,
    handleUpdateImageMetadata,
    handleRemoveImage,
    handleSubmit,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
  };
};

export default useDealerAddonManagement;
