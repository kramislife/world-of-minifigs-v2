import { useEffect } from "react";
import {
  useGetSubCollectionsQuery,
  useCreateSubCollectionMutation,
  useUpdateSubCollectionMutation,
  useDeleteSubCollectionMutation,
  useGetCollectionsQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
import { validateSubCollection } from "@/utils/validation";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  subCollectionName: "",
  description: "",
  collection: "",
  isActive: true,
  image: null,
};

const columns = [
  { key: "subCollectionName", label: "Sub-collection" },
  { key: "collection", label: "Collection" },
  { key: "description", label: "Description" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useSubCollectionManagement = () => {
  // ------------------------------- Media ------------------------------------
  const {
    filePreview,
    setFilePreview,
    fileInputRef,
    resetFile,
    handleFileChange: onFileChange,
    handleRemoveFile: onRemoveFile,
  } = useMediaPreview();

  // ------------------------------- Mutations ------------------------------------
  const [createSubCollection, { isLoading: isCreating }] =
    useCreateSubCollectionMutation();
  const [updateSubCollection, { isLoading: isUpdating }] =
    useUpdateSubCollectionMutation();
  const [deleteSubCollection, { isLoading: isDeleting }] =
    useDeleteSubCollectionMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createSubCollection,
    updateFn: updateSubCollection,
    deleteFn: deleteSubCollection,
    entityName: "sub-collection",
    onReset: resetFile,
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: subCollectionsData, isLoading: isLoadingSubCollections } =
    useGetSubCollectionsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: collectionsData, isLoading: isLoadingCollections } =
    useGetCollectionsQuery();

  const {
    items: subCollections,
    totalItems,
    totalPages,
  } = extractPaginatedData(subCollectionsData, "subCollections");

  const collections = collectionsData?.collections || [];

  // ------------------------------- Effects ------------------------------------
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  // ------------------------------- Submit Mode ------------------------------------
  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- File Handlers ------------------------------------
  const handleFileChange = async (e) => {
    const dataUrl = await onFileChange(e);
    if (dataUrl) {
      crud.setFormData((prev) => ({ ...prev, image: dataUrl }));
    }
  };

  const handleRemoveFile = () => {
    onRemoveFile();
    crud.setFormData((prev) => ({ ...prev, image: null }));
  };

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (subCollection) => {
    crud.openEdit(subCollection, {
      subCollectionName: subCollection.subCollectionName || "",
      description: subCollection.description || "",
      collection: subCollection.collectionId?._id || "",
      isActive: subCollection.isActive !== false,
      image: null,
    });

    setFilePreview(subCollection.image?.url || null);
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateSubCollection(crud.formData, crud.dialogMode)) return;

    const payload = {
      subCollectionName: sanitizeString(crud.formData.subCollectionName),
      description: sanitizeString(crud.formData.description),
      collection: crud.formData.collection,
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
    subCollections,
    totalItems,
    totalPages,
    collections,
    columns,
    isLoadingSubCollections,
    isLoadingCollections,
    isSubmitting,
    isDeleting,
    handleFileChange,
    handleRemoveFile,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useSubCollectionManagement;
