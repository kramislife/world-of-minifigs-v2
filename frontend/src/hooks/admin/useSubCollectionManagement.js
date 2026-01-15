import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  useGetSubCollectionsQuery,
  useCreateSubCollectionMutation,
  useUpdateSubCollectionMutation,
  useDeleteSubCollectionMutation,
  useGetCollectionsQuery,
} from "@/redux/api/adminApi";

const useSubCollectionManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubCollection, setSelectedSubCollection] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState({
    subCollectionName: "",
    description: "",
    collection: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: subCollectionsData, isLoading: isLoadingSubCollections } =
    useGetSubCollectionsQuery({
      page,
      limit,
      search: search || undefined,
    });
  const { data: collectionsData, isLoading: isLoadingCollections } =
    useGetCollectionsQuery();

  const [createSubCollection, { isLoading: isCreating }] =
    useCreateSubCollectionMutation();
  const [updateSubCollection, { isLoading: isUpdating }] =
    useUpdateSubCollectionMutation();
  const [deleteSubCollection, { isLoading: isDeleting }] =
    useDeleteSubCollectionMutation();

  // Extract data from server response
  const subCollections = subCollectionsData?.subCollections || [];
  const totalItems = subCollectionsData?.pagination?.totalItems || 0;
  const totalPages = subCollectionsData?.pagination?.totalPages || 1;

  // Get collections list
  const collections = collectionsData?.collections || [];

  // Column definitions
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCollectionChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      collection: value,
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

    if (!formData.subCollectionName.trim()) {
      toast.error("Sub-collection name is required", {
        description: "Please enter a sub-collection name.",
      });
      return;
    }

    if (!formData.collection) {
      toast.error("Collection is required", {
        description: "Please select a parent collection.",
      });
      return;
    }

    if (dialogMode === "add" && !formData.image) {
      toast.error("Sub-collection image is required", {
        description: "Please upload an image for the sub-collection.",
      });
      return;
    }

    try {
      const subCollectionData = {
        subCollectionName: formData.subCollectionName.trim(),
        description: formData.description.trim(),
        collection: formData.collection,
        ...(formData.image && { image: formData.image }),
      };

      if (dialogMode === "edit" && selectedSubCollection) {
        const subCollectionId =
          selectedSubCollection._id || selectedSubCollection.id;
        const response = await updateSubCollection({
          id: subCollectionId,
          ...subCollectionData,
        }).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Sub-collection updated successfully",
            {
              description:
                response.description ||
                `The sub-collection "${response.subCollection.subCollectionName}" has been updated.`,
            }
          );

          setFormData({
            subCollectionName: "",
            description: "",
            collection: "",
            image: null,
          });
          setImagePreview(null);
          setSelectedSubCollection(null);
          setDialogMode("add");
          setDialogOpen(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else {
        const response = await createSubCollection(subCollectionData).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Sub-collection created successfully",
            {
              description:
                response.description ||
                `The sub-collection "${response.subCollection.subCollectionName}" has been created.`,
            }
          );

          setFormData({
            subCollectionName: "",
            description: "",
            collection: "",
            image: null,
          });
          setImagePreview(null);
          setDialogOpen(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} sub-collection error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${
            dialogMode === "edit" ? "update" : "create"
          } sub-collection`,
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
      setFormData({
        subCollectionName: "",
        description: "",
        collection: "",
        image: null,
      });
      setImagePreview(null);
      setSelectedSubCollection(null);
      setDialogMode("add");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedSubCollection(null);
    setFormData({
      subCollectionName: "",
      description: "",
      collection: "",
      image: null,
    });
    setImagePreview(null);
    setDialogOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (subCollection) => {
    setDialogMode("edit");
    setSelectedSubCollection(subCollection);
    setFormData({
      subCollectionName: subCollection.subCollectionName || "",
      description: subCollection.description || "",
      collection:
        subCollection.collectionId?._id || subCollection.collectionId || "",
      image: null,
    });

    const imageUrl = subCollection.image?.url || null;
    setImagePreview(imageUrl);
    setDialogOpen(true);
  };

  const handleDelete = (subCollection) => {
    setSelectedSubCollection(subCollection);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubCollection) return;

    try {
      const subCollectionId =
        selectedSubCollection._id || selectedSubCollection.id;
      const response = await deleteSubCollection(subCollectionId).unwrap();

      if (response.success) {
        toast.success(
          response.message || "Sub-collection deleted successfully",
          {
            description:
              response.description ||
              `The sub-collection "${selectedSubCollection.subCollectionName}" has been removed.`,
          }
        );

        setDeleteDialogOpen(false);
        setSelectedSubCollection(null);
      }
    } catch (error) {
      console.error("Delete sub-collection error:", error);
      toast.error(error?.data?.message || "Failed to delete sub-collection", {
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
    selectedSubCollection,
    dialogMode,
    formData,
    imagePreview,
    fileInputRef,
    page,
    limit,
    search,
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

export default useSubCollectionManagement;
