import React from "react";
import { Plus, Upload, X } from "lucide-react";
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
import useCollectionManagement from "@/hooks/admin/useCollectionManagement";

const CollectionManagement = () => {
  const {
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
  } = useCollectionManagement();

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
