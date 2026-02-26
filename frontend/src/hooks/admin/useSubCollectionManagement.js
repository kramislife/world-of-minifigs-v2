import { useEffect } from "react";
import {
  useGetSubCollectionsQuery,
  useCreateSubCollectionMutation,
  useUpdateSubCollectionMutation,
  useDeleteSubCollectionMutation,
  useGetCollectionsQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizePayload } from "@/utils/formatting";
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
  const {
    filePreview,
    setFilePreview,
    fileInputRef,
    resetFile,
    handleFileChange: onFileChange,
    handleRemoveFile: onRemoveFile,
  } = useMediaPreview();

  const [createSubCollection, { isLoading: isCreating }] =
    useCreateSubCollectionMutation();
  const [updateSubCollection, { isLoading: isUpdating }] =
    useUpdateSubCollectionMutation();
  const [deleteSubCollection, { isLoading: isDeleting }] =
    useDeleteSubCollectionMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createSubCollection,
    updateFn: updateSubCollection,
    deleteFn: deleteSubCollection,
    entityName: "sub-collection",
    onReset: resetFile,
  });

  // Fetch data
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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleCollectionChange = (value) => {
    crud.setFormData((prev) => ({ ...prev, collection: value }));
  };

  const handleFileChange = async (e) => {
    const dataUrl = await onFileChange(e);
    if (dataUrl) crud.setFormData((prev) => ({ ...prev, image: dataUrl }));
  };

  const handleRemoveFile = () => {
    onRemoveFile();
    crud.setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleEdit = (subCollection) => {
    crud.openEdit(subCollection, {
      subCollectionName: subCollection.subCollectionName || "",
      description: subCollection.description || "",
      collection:
        subCollection.collectionId?._id || subCollection.collectionId || "",
      isActive: subCollection.isActive !== false,
      image: null,
    });
    setFilePreview(subCollection.image?.url || null);
  };

  const handleSubmit = async () => {
    if (!validateSubCollection(crud.formData, crud.dialogMode)) return;

    const payload = {
      subCollectionName: crud.formData.subCollectionName,
      description: crud.formData.description,
      collection: crud.formData.collection,
      isActive: crud.formData.isActive,
      ...(crud.formData.image && { image: crud.formData.image }),
    };

    await crud.submitForm(payload);
  };

  return {
    ...crud,
    selectedSubCollection: crud.selectedItem,
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

    // Handlers
    handleCollectionChange,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
    handleEdit,
  };
};

export default useSubCollectionManagement;
