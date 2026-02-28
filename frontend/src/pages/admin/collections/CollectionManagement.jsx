import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import { display } from "@/utils/formatting";
import useCollectionManagement from "@/hooks/admin/useCollectionManagement";

const CollectionManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
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
    handleValueChange,
    handleCollectionFileChange,
    handleCollectionFileRemove,
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
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Collection Management"
        description="Manage product collections in your store"
        actionLabel="Add Collection"
        onAction={handleAdd}
      />

      {/* Table Layout */}
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
            {/* Collection Name */}
            <TableCell maxWidth="200px">
              {display(collection.collectionName)}
            </TableCell>

            {/* Description */}
            <TableCell maxWidth="300px">
              {display(collection.description)}
            </TableCell>

            {/* Featured */}
            <StatusCell
              isActive={collection.isFeatured}
              activeLabel="Featured"
              inactiveLabel="Not Featured"
            />

            {/* Status */}
            <StatusCell isActive={collection.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={collection.createdAt}
              updatedAt={collection.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(collection)}
              onDelete={() => handleDelete(collection)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Collection" : "Add Collection"}
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
        <div className="space-y-4">
          {/* Collection Name */}
          <div className="space-y-2">
            <Label htmlFor="collectionName">Collection Name</Label>
            <Input
              id="collectionName"
              name="collectionName"
              placeholder="e.g., Star Wars, Marvel"
              value={formData.collectionName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
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

          {/* Image Attachment */}
          <MediaUpload
            label="Image Attachment"
            preview={filePreview}
            onChange={handleCollectionFileChange}
            onRemove={handleCollectionFileRemove}
            accept="image/*"
            description="PNG, JPG, WEBP"
            disabled={isSubmitting}
          />

          {/* Featured Switch */}
          <AdminSwitchField
            id="isFeatured"
            label="Featured Collection"
            description="You can feature up to 2 collections"
            checked={formData.isFeatured}
            onChange={handleValueChange("isFeatured")}
            disabled={isSubmitting}
          />

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this collection and its related items will be hidden"
            checked={formData.isActive}
            onChange={handleValueChange("isActive")}
            disabled={isSubmitting}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={display(selectedItem?.collectionName)}
        title="Delete Collection"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionManagement;
