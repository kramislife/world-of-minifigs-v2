import { useEffect } from "react";
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useGetCollectionsQuery,
  useDeleteCollectionMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
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
  // ------------------------------- Media ------------------------------------
  const {
    filePreview,
    setFilePreview,
    fileInputRef,
    resetFile,
    handleFileChange,
    handleRemoveFile,
  } = useMediaPreview();

  // ------------------------------- Mutations ------------------------------------
  const [createCollection, { isLoading: isCreating }] =
    useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] =
    useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] =
    useDeleteCollectionMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createCollection,
    updateFn: updateCollection,
    deleteFn: deleteCollection,
    entityName: "collection",
    onReset: resetFile,
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useGetCollectionsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: collections,
    totalItems,
    totalPages,
  } = extractPaginatedData(collectionsData, "collections");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Media Handlers ------------------------------------
  const handleCollectionFileChange = async (e) => {
    const dataUrl = await handleFileChange(e);
    if (dataUrl) {
      crud.setFormData((prev) => ({
        ...prev,
        image: dataUrl,
      }));
    }
  };

  const handleCollectionFileRemove = () => {
    handleRemoveFile();
    crud.setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  // ------------------------------- Edit Handler ------------------------------------
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

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateCollection(crud.formData)) return;

    const payload = {
      collectionName: sanitizeString(crud.formData.collectionName),
      description: sanitizeString(crud.formData.description),
      isFeatured: crud.formData.isFeatured,
      isActive: crud.formData.isActive,
      ...(crud.formData.image && { image: crud.formData.image }),
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

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    filePreview,
    fileInputRef,
    collections,
    totalItems,
    totalPages,
    columns,
    isLoadingCollections,
    isSubmitting,
    isDeleting,
    handleCollectionFileChange,
    handleCollectionFileRemove,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useCollectionManagement;
