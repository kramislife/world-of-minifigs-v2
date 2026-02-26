import React from "react";
import { formatDate } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import useCollectionManagement from "@/hooks/admin/useCollectionManagement";

const CollectionManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedCollection,
    dialogMode,
    formData,
    filePreview,
    page,
    limit,
    search,
    collections,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingCollections,
    isSubmitting,
    isDeleting,
    handleChange,
    handleSwitchChange,
    handleFileChange,
    handleRemoveFile,
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
      <AdminManagementHeader
        title="Collection Management"
        description="Manage product collections in your store"
        actionLabel="Add Collection"
        onAction={handleAdd}
      />

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
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
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
              {collection.isActive ? (
                <Badge variant="accent">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {collection.createdAt ? formatDate(collection.createdAt) : "-"}
            </TableCell>
            <TableCell>
              {collection.updatedAt ? formatDate(collection.updatedAt) : "-"}
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
        isLoading={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <MediaUpload
          label="Image Attachment"
          preview={filePreview}
          mediaType="image"
          onChange={handleFileChange}
          onRemove={handleRemoveFile}
          accept="image/*"
          description="PNG, JPG, WEBP"
        />

        <AdminSwitchField
          id="isFeatured"
          label="Featured Collection"
          description="You can feature up to 2 collections"
          checked={formData.isFeatured}
          onChange={handleSwitchChange("isFeatured")}
          disabled={isSubmitting}
        />

        <AdminSwitchField
          id="isActive"
          label="Visibility"
          description="When disabled, this collection, related sub-collections and products will be hidden"
          checked={formData.isActive}
          onChange={handleSwitchChange("isActive")}
          disabled={isSubmitting}
        />
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
