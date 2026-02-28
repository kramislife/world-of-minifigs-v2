import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import {
  AdminFormInput,
  AdminFormTextarea,
} from "@/components/shared/AdminFormInput";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import { display } from "@/utils/formatting";
import useSubCollectionManagement from "@/hooks/admin/useSubCollectionManagement";

const SubCollectionManagement = () => {
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
    subCollections,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    collections,
    columns,
    isLoadingSubCollections,
    isLoadingCollections,
    isSubmitting,
    isDeleting,
    handleChange,
    handleValueChange,
    handleSubCollectionFileChange,
    handleSubCollectionFileRemove,
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
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Sub-collection Management"
        description="Manage product sub-collections in your store"
        actionLabel="Add Sub-collection"
        onAction={handleAdd}
      />

      {/* Table Layout */}
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
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
        columns={columns}
        data={subCollections}
        isLoading={isLoadingSubCollections}
        renderRow={(subCollection) => (
          <>
            {/* Sub-collection Name */}
            <TableCell maxWidth="200px">
              {display(subCollection.subCollectionName)}
            </TableCell>

            {/* Parent Collection */}
            <TableCell maxWidth="200px">
              {display(subCollection.collectionId?.collectionName)}
            </TableCell>

            {/* Description */}
            <TableCell maxWidth="300px">
              {display(subCollection.description)}
            </TableCell>

            {/* Status */}
            <StatusCell isActive={subCollection.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={subCollection.createdAt}
              updatedAt={subCollection.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(subCollection)}
              onDelete={() => handleDelete(subCollection)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={
          dialogMode === "edit" ? "Edit Sub-collection" : "Add Sub-collection"
        }
        description={
          dialogMode === "edit"
            ? "Update the sub-collection details."
            : "Create a new sub-collection for your products."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit"
            ? "Update Sub-collection"
            : "Create Sub-collection"
        }
      >
        <div className="space-y-4">
          {/* Collection */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="collection">Collection</Label>
            <Select
              value={formData.collection}
              onValueChange={handleValueChange("collection")}
              disabled={isSubmitting || isLoadingCollections}
            >
              <SelectTrigger id="collection" className="w-full">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection._id} value={collection._id}>
                    {collection.collectionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-collection Name */}
          <AdminFormInput
            label="Sub-collection Name"
            name="subCollectionName"
            placeholder="Headgear, Legs, Torso"
            value={formData.subCollectionName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="col-span-2"
          />

          {/* Description */}
          <AdminFormTextarea
            label="Description"
            name="description"
            placeholder="Enter sub-collection description..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Image Upload */}
          <MediaUpload
            label="Image Attachment"
            preview={filePreview}
            onChange={handleSubCollectionFileChange}
            onRemove={handleSubCollectionFileRemove}
            accept="image/*"
            description="PNG, JPG, WEBP"
            previewClassName="aspect-square"
            disabled={isSubmitting}
          />

          {/* Visibility */}
          <VisibilitySwitch
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
        itemName={display(selectedItem?.subCollectionName)}
        title="Delete Sub-collection"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SubCollectionManagement;
