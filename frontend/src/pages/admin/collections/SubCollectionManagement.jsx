import React from "react";
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
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
} from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
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

            {/* Visibility */}
            <TableCell>
              <StatusBadge isActive={subCollection.isActive} />
            </TableCell>
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
          <div className="grid grid-cols-3 gap-3">
            {/* Sub-collection Name */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="subCollectionName">Sub-collection Name</Label>
              <Input
                id="subCollectionName"
                name="subCollectionName"
                placeholder="e.g., Star Wars, Marvel"
                value={formData.subCollectionName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Parent Collection */}
            <div className="space-y-2 col-span-1">
              <Label htmlFor="collection">Parent Collection</Label>
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter sub-collection description (optional)"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

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

          {/* Visibility Switch */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this sub-collection and related products will be hidden"
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
