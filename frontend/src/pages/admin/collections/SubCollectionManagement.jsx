import React from "react";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useSubCollectionManagement from "@/hooks/admin/useSubCollectionManagement";

const SubCollectionManagement = () => {
  const {
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
  } = useSubCollectionManagement();

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sub-collection Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product sub-collections in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Sub-collection
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search sub-collections..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={subCollections}
        isLoading={isLoadingSubCollections}
        renderRow={(subCollection) => (
          <>
            <TableCell maxWidth="200px">
              {subCollection.subCollectionName}
            </TableCell>
            <TableCell maxWidth="200px">
              {subCollection.collectionId?.collectionName || "-"}
            </TableCell>
            <TableCell maxWidth="300px">
              {subCollection.description || "-"}
            </TableCell>
            <TableCell>
              {subCollection.createdAt
                ? new Date(subCollection.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {subCollection.updatedAt
                ? new Date(subCollection.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(subCollection)}
              onDelete={() => handleDelete(subCollection)}
            />
          </>
        )}
      />

      {/* Add/Edit Sub-collection Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={
          dialogMode === "edit"
            ? "Edit Sub-collection"
            : "Add New Sub-collection"
        }
        description={
          dialogMode === "edit"
            ? "Update the sub-collection details."
            : "Create a new sub-collection for your products."
        }
        onSubmit={handleSubmit}
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit"
            ? "Update Sub-collection"
            : "Create Sub-collection"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="collection">Collection</Label>
          <Select
            value={formData.collection}
            onValueChange={handleCollectionChange}
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
          >
            <SelectTrigger id="collection" className="w-full">
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCollections ? (
                <SelectItem value="loading" disabled>
                  Loading collections...
                </SelectItem>
              ) : collections.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No collections available
                </SelectItem>
              ) : (
                collections.map((collection) => (
                  <SelectItem
                    key={collection._id || collection.id}
                    value={collection._id || collection.id}
                  >
                    {collection.collectionName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subCollectionName">Sub-collection Name</Label>
          <Input
            id="subCollectionName"
            name="subCollectionName"
            type="text"
            placeholder="e.g., The Mandalorian, Hogwarts Castle"
            value={formData.subCollectionName}
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
            placeholder="Enter sub-collection description (optional)"
            value={formData.description}
            onChange={handleChange}
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Sub-collection Image</Label>
          {imagePreview ? (
            <div className="relative w-full h-48 border rounded-lg overflow-hidden">
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
            <label
              htmlFor="image"
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors block"
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {dialogMode === "edit"
                  ? "Upload a new image to replace the current one"
                  : "Click to upload an image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP up to 5MB
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
            </label>
          )}
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedSubCollection?.subCollectionName || ""}
        title="Delete Sub-collection"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SubCollectionManagement;


