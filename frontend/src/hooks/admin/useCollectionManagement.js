import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useGetCollectionsQuery,
  useDeleteCollectionMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { validateFile, readFileAsDataURL } from "@/utils/fileHelpers";

const initialFormData = {
  collectionName: "",
  description: "",
  isFeatured: false,
  image: null,
};

const useCollectionManagement = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const resetImages = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const [createCollection, { isLoading: isCreating }] =
    useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] =
    useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] =
    useDeleteCollectionMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createCollection,
    updateFn: updateCollection,
    deleteFn: deleteCollection,
    entityName: "collection",
    onReset: resetImages,
  });

  // Fetch data
  const { data: collectionsResponse, isLoading: isLoadingCollections } =
    useGetCollectionsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { items: collections, totalItems, totalPages } =
    extractPaginatedData(collectionsResponse, "collections");

  const columns = [
    { key: "collectionName", label: "Collection" },
    { key: "description", label: "Description" },
    { key: "isFeatured", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    crud.setFormData((prev) => ({ ...prev, isFeatured: checked }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !validateFile(file)) return;

    const dataUrl = await readFileAsDataURL(file);
    setImagePreview(dataUrl);
    crud.setFormData((prev) => ({ ...prev, image: dataUrl }));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    crud.setFormData((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (collection) => {
    crud.openEdit(collection, {
      collectionName: collection.collectionName || "",
      description: collection.description || "",
      isFeatured: collection.isFeatured || false,
      image: null,
    });
    setImagePreview(collection.image?.url || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.collectionName.trim()) {
      toast.error("Collection name is required", {
        description: "Please enter a collection name.",
      });
      return;
    }

    if (crud.dialogMode === "add" && !crud.formData.image) {
      toast.error("Collection image is required", {
        description: "Please upload an image for the collection.",
      });
      return;
    }

    await crud.submitForm({
      collectionName: crud.formData.collectionName.trim(),
      description: crud.formData.description.trim(),
      isFeatured: crud.formData.isFeatured,
      ...(crud.formData.image && { image: crud.formData.image }),
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedCollection: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    imagePreview,
    fileInputRef,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    collections,
    totalItems,
    totalPages,
    columns,
    isLoadingCollections,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleChange,
    handleSwitchChange,
    handleImageChange,
    handleRemoveImage,
    handleSubmit,
    handleDialogClose: crud.handleDialogClose,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
  };
};

export default useCollectionManagement;
