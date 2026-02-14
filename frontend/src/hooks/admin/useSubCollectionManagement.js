import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  useGetSubCollectionsQuery,
  useCreateSubCollectionMutation,
  useUpdateSubCollectionMutation,
  useDeleteSubCollectionMutation,
  useGetCollectionsQuery,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { validateFile, readFileAsDataURL } from "@/utils/fileHelpers";

const initialFormData = {
  subCollectionName: "",
  description: "",
  collection: "",
  image: null,
};

const useSubCollectionManagement = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const resetImages = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

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
    onReset: resetImages,
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

  const columns = [
    { key: "subCollectionName", label: "Sub-collection" },
    { key: "collection", label: "Collection" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollectionChange = (value) => {
    crud.setFormData((prev) => ({ ...prev, collection: value }));
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

  const handleEdit = (subCollection) => {
    crud.openEdit(subCollection, {
      subCollectionName: subCollection.subCollectionName || "",
      description: subCollection.description || "",
      collection:
        subCollection.collectionId?._id || subCollection.collectionId || "",
      image: null,
    });
    setImagePreview(subCollection.image?.url || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.subCollectionName.trim()) {
      toast.error("Sub-collection name is required", {
        description: "Please enter a sub-collection name.",
      });
      return;
    }

    if (!crud.formData.collection) {
      toast.error("Collection is required", {
        description: "Please select a parent collection.",
      });
      return;
    }

    if (crud.dialogMode === "add" && !crud.formData.image) {
      toast.error("Sub-collection image is required", {
        description: "Please upload an image for the sub-collection.",
      });
      return;
    }

    await crud.submitForm({
      subCollectionName: crud.formData.subCollectionName.trim(),
      description: crud.formData.description.trim(),
      collection: crud.formData.collection,
      ...(crud.formData.image && { image: crud.formData.image }),
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedSubCollection: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    imagePreview,
    fileInputRef,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    subCollections,
    totalItems,
    totalPages,
    collections,
    columns,
    isLoadingSubCollections,
    isLoadingCollections,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleChange,
    handleCollectionChange,
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

export default useSubCollectionManagement;
