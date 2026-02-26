import { useEffect } from "react";
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useGetCollectionsQuery,
  useDeleteCollectionMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizePayload } from "@/utils/formatting";
import { validateCollection } from "@/utils/validation";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  collectionName: "",
  description: "",
  isFeatured: false,
  isActive: true,
  image: null,
};

const columns = [
  { key: "collectionName", label: "Collection" },
  { key: "description", label: "Description" },
  { key: "isFeatured", label: "Featured" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useCollectionManagement = () => {
  const {
    filePreview,
    setFilePreview,
    fileInputRef,
    resetFile,
    handleFileChange: onFileChange,
    handleRemoveFile: onRemoveFile,
  } = useMediaPreview();

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
    onReset: resetFile,
  });

  // Fetch data
  const { data: collectionsResponse, isLoading: isLoadingCollections } =
    useGetCollectionsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: collections,
    totalItems,
    totalPages,
  } = extractPaginatedData(collectionsResponse, "collections");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleFileChange = async (e) => {
    const dataUrl = await onFileChange(e);
    if (dataUrl) crud.setFormData((prev) => ({ ...prev, image: dataUrl }));
  };

  const handleRemoveFile = () => {
    onRemoveFile();
    crud.setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleEdit = (collection) => {
    crud.openEdit(collection, {
      collectionName: collection.collectionName || "",
      description: collection.description || "",
      isFeatured: collection.isFeatured || false,
      isActive: collection.isActive !== false,
      image: null,
    });
    setFilePreview(collection.image?.url || null);
  };

  const handleSubmit = async () => {
    if (!validateCollection(crud.formData, crud.dialogMode)) return;

    const payload = {
      collectionName: crud.formData.collectionName,
      description: crud.formData.description,
      isFeatured: crud.formData.isFeatured,
      isActive: crud.formData.isActive,
      ...(crud.formData.image && { image: crud.formData.image }),
    };

    await crud.submitForm(payload);
  };

  return {
    ...crud,
    selectedCollection: crud.selectedItem,
    filePreview,
    fileInputRef,
    collections,
    totalItems,
    totalPages,
    columns,
    isLoadingCollections,
    isSubmitting,
    isDeleting,

    // Handlers
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
    handleEdit,
  };
};

export default useCollectionManagement;
