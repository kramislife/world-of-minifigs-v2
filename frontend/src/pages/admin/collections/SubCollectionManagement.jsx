import React from "react";
import { formatDate } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import useSubCollectionManagement from "@/hooks/admin/useSubCollectionManagement";

const SubCollectionManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedSubCollection,
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

    // Handlers
    handleChange,
    handleCollectionChange,
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
  } = useSubCollectionManagement();

  return (
    <div className="space-y-5">
      <AdminManagementHeader
        title="Sub-collection Management"
        description="Manage product sub-collections in your store"
        actionLabel="Add Sub-collection"
        onAction={handleAdd}
      />

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
            <TableCell maxWidth="200px">
              {subCollection.subCollectionName}
            </TableCell>
            <TableCell maxWidth="200px">
              {subCollection.collectionId?.collectionName ||
                subCollection.collectionId ||
                "-"}
            </TableCell>
            <TableCell maxWidth="300px">
              {subCollection.description || "-"}
            </TableCell>
            <TableCell>
              {subCollection.isActive ? (
                <Badge variant="accent">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {subCollection.createdAt
                ? formatDate(subCollection.createdAt)
                : "-"}
            </TableCell>
            <TableCell>
              {subCollection.updatedAt
                ? formatDate(subCollection.updatedAt)
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
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit"
            ? "Update Sub-collection"
            : "Create Sub-collection"
        }
      >
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="subCollectionName">Sub-collection Name</Label>
            <Input
              id="subCollectionName"
              name="subCollectionName"
              type="text"
              placeholder="e.g., Star Wars, Harry Potter, Marvel"
              value={formData.subCollectionName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 col-span-1">
            <Label htmlFor="collection">Parent Collection</Label>
            <Select
              value={formData.collection}
              onValueChange={handleCollectionChange}
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

        <MediaUpload
          label="Image Attachment"
          preview={filePreview}
          mediaType="image"
          onChange={handleFileChange}
          onRemove={handleRemoveFile}
          accept="image/*"
          description="PNG, JPG, WEBP"
        />

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Label htmlFor="isActive">Visibility</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When disabled, this sub-collection and related products will be
              hidden
            </p>
          </div>

          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              handleSwitchChange("isActive", checked)
            }
            disabled={isSubmitting}
          />
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
