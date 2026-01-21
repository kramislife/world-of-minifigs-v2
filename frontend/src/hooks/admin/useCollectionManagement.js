import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useGetCollectionsQuery,
  useDeleteCollectionMutation,
} from "@/redux/api/adminApi";

const useCollectionManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState({
    collectionName: "",
    description: "",
    isFeatured: false,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: collectionsResponse, isLoading: isLoadingCollections } =
    useGetCollectionsQuery({
      page,
      limit,
      search: search || undefined,
    });

  const [createCollection, { isLoading: isCreating }] =
    useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] =
    useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] =
    useDeleteCollectionMutation();

  // Extract data from server response
  const collections = collectionsResponse?.collections || [];
  const totalItems = collectionsResponse?.pagination?.totalItems || 0;
  const totalPages = collectionsResponse?.pagination?.totalPages || 1;

  // Column definitions
  const columns = [
    { key: "collectionName", label: "Collection" },
    { key: "description", label: "Description" },
    { key: "isFeatured", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const resetForm = () => {
    setFormData({
      collectionName: "",
      description: "",
      isFeatured: false,
      image: null,
    });
    setImagePreview(null);
    setSelectedCollection(null);
    setDialogMode("add");
    setDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isFeatured: checked,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please select an image file.",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.collectionName.trim()) {
      toast.error("Collection name is required", {
        description: "Please enter a collection name.",
      });
      return;
    }

    if (dialogMode === "add" && !formData.image) {
      toast.error("Collection image is required", {
        description: "Please upload an image for the collection.",
      });
      return;
    }

    try {
      const collectionData = {
        collectionName: formData.collectionName.trim(),
        description: formData.description.trim(),
        isFeatured: formData.isFeatured,
        ...(formData.image && { image: formData.image }),
      };

      if (dialogMode === "edit" && selectedCollection) {
        const collectionId = selectedCollection._id || selectedCollection.id;
        const response = await updateCollection({
          id: collectionId,
          ...collectionData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Collection updated successfully", {
            description:
              response.description ||
              `The collection "${response.collection.collectionName}" has been updated.`,
          });
          resetForm();
        }
      } else {
        const response = await createCollection(collectionData).unwrap();

        if (response.success) {
          toast.success(response.message || "Collection created successfully", {
            description:
              response.description ||
              `The collection "${response.collection.collectionName}" has been added.`,
          });
          resetForm();
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} collection error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${dialogMode === "edit" ? "update" : "create"} collection`,
        {
          description:
            error?.data?.description ||
            "An unexpected error occurred. Please try again.",
        }
      );
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (collection) => {
    setDialogMode("edit");
    setSelectedCollection(collection);
    setFormData({
      collectionName: collection.collectionName || "",
      description: collection.description || "",
      isFeatured: collection.isFeatured || false,
      image: null,
    });
    setImagePreview(collection.image?.url || null);
    setDialogOpen(true);
  };

  const handleDelete = (collection) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollection) return;

    try {
      const collectionId = selectedCollection._id || selectedCollection.id;
      const response = await deleteCollection(collectionId).unwrap();

      if (response.success) {
        toast.success(response.message || "Collection deleted successfully", {
          description:
            response.description ||
            `The collection "${selectedCollection.collectionName}" has been removed.`,
        });

        setDeleteDialogOpen(false);
        setSelectedCollection(null);
      }
    } catch (error) {
      console.error("Delete collection error:", error);
      toast.error(error?.data?.message || "Failed to delete collection", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
    selectedCollection,
    dialogMode,
    formData,
    imagePreview,
    fileInputRef,
    page,
    limit,
    search,
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
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    setDeleteDialogOpen,
  };
};

export default useCollectionManagement;
