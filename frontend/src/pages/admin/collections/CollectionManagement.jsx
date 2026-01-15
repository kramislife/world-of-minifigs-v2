import React, { useState, useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useGetCollectionsQuery,
  useDeleteCollectionMutation,
} from "@/redux/api/adminApi";

const CollectionManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
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
      search: search || undefined, // Only send if not empty
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

  // Column definitions based on Collection model
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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please select an image file.",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      // Create preview
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

    // Validate form
    if (!formData.collectionName.trim()) {
      toast.error("Collection name is required", {
        description: "Please enter a collection name.",
      });
      return;
    }

    // Validate image for new collections
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
        // Update existing collection
        const collectionId = selectedCollection._id || selectedCollection.id;
        const response = await updateCollection({
          id: collectionId,
          ...collectionData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Collection updated successfully", {
            description: `The collection "${response.collection.collectionName}" has been updated.`,
          });

          // Reset form and close dialog
          resetForm();
        }
      } else {
        // Create new collection
        const response = await createCollection(collectionData).unwrap();

        if (response.success) {
          toast.success(response.message || "Collection created successfully", {
            description: `The collection "${response.collection.collectionName}" has been added.`,
          });

          // Reset form and close dialog
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
      image: null, // Don't preload existing image
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

      toast.success(response.message || "Collection deleted successfully", {
        description: `The collection "${selectedCollection.collectionName}" has been removed.`,
      });

      setDeleteDialogOpen(false);
      setSelectedCollection(null);
    } catch (error) {
      console.error("Delete collection error:", error);
      toast.error(error?.data?.message || "Failed to delete collection", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle pagination and search changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collection Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product collections in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Collection
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search collections..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={collections}
        isLoading={isLoadingCollections}
        loadingMessage="Loading collections..."
        emptyMessage="No collection found..."
        renderRow={(collection) => (
          <>
            <TableCell maxWidth="200px">{collection.collectionName}</TableCell>
            <TableCell maxWidth="300px">
              {collection.description || "-"}
            </TableCell>
            <TableCell>
              {collection.isFeatured ? (
                <Badge variant="accent">Featured</Badge>
              ) : (
                <Badge variant="secondary">Collection</Badge>
              )}
            </TableCell>
            <TableCell>
              {collection.createdAt
                ? new Date(collection.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {collection.updatedAt
                ? new Date(collection.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(collection)}
              onDelete={() => handleDelete(collection)}
            />
          </>
        )}
      />

      {/* Add/Edit Collection Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Collection" : "Add New Collection"}
        description={
          dialogMode === "edit"
            ? "Update the collection details."
            : "Create a new collection for your products."
        }
        onSubmit={handleSubmit}
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit" ? "Update Collection" : "Create Collection"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="collectionName">Collection Name</Label>
          <Input
            id="collectionName"
            name="collectionName"
            type="text"
            placeholder="e.g., Star Wars, Harry Potter, Marvel"
            value={formData.collectionName}
            onChange={handleChange}
            required
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter collection description (optional)"
            value={formData.description}
            onChange={handleChange}
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image Attachment</Label>
          {imagePreview ? (
            <div className="relative w-full h-60 border rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <Label
              htmlFor="image"
              className="border-2 border-dashed rounded-md p-7 text-center cursor-pointer hover:border-accent/50 transition-colors block"
            >
              <Upload className="mx-auto h-12 w-12 text-popover-foreground/80" />
              <p className="mt-2 text-sm text-popover-foreground/80">
                {dialogMode === "edit"
                  ? "Upload a new image to replace the current one"
                  : "Click to upload an image"}
              </p>
              <p className="text-xs text-popover-foreground/80 mt-1">
                PNG, JPG, WEBP
              </p>
              <Input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
                className="hidden"
              />
            </Label>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="isFeatured">Featured Collection</Label>
            <p className="text-xs text-popover-foreground/80">
              Mark as featured (max 2 featured collections)
            </p>
          </div>
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={handleSwitchChange}
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedCollection?.collectionName || ""}
        title="Delete Collection"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionManagement;
