import React from "react";
import { formatDate } from "@/utils/formatting";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    filePreview,
    fileInputRef,
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
        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="collection">Parent Collection</Label>
          <Select
            value={formData.collection}
            onValueChange={handleCollectionChange}
            disabled={isSubmitting || isLoadingCollections}
          >
            <SelectTrigger id="collection">
              <SelectValue placeholder="Select parent collection" />
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

        <div className="space-y-2">
          <Label htmlFor="image">Image Attachment</Label>
          {filePreview ? (
            <div className="relative w-full h-60 border rounded-lg overflow-hidden">
              <img
                src={filePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
                disabled={isSubmitting}
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
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </Label>
          )}
        </div>

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
