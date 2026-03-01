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
  AdminFormInput,
  AdminFormTextarea,
} from "@/components/shared/AdminFormInput";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import DeleteDialog from "@/components/table/DeleteDialog";
import BannerPreview from "@/pages/admin/banner/BannerPreview";
import BannerButtonFields from "@/pages/admin/banner/BannerButtonFields";
import { display } from "@/utils/formatting";
import useBannerManagement from "@/hooks/admin/useBannerManagement";

const BannerManagement = () => {
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
    banners,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    columns,
    isLoadingBanners,
    isSubmitting,
    isDeleting,
    handleChange,
    handleValueChange,
    handleNestedChange,
    handleBannerFileChange,
    handleBannerFileRemove,
    handleSubmit,
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    setDeleteDialogOpen,
  } = useBannerManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Banner Management"
        description="Manage homepage banners"
        actionLabel="Add Banner"
        onAction={handleAdd}
      />

      {/* Table Layout */}
      <TableLayout
        searchPlaceholder="Search banners..."
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
        data={banners}
        isLoading={isLoadingBanners}
        renderRow={(banner) => (
          <>
            {/*  Badge */}
            <TableCell>{display(banner.badge)}</TableCell>

            {/*  Label */}
            <TableCell maxWidth="200px">{display(banner.label)}</TableCell>

            {/*  Order */}
            <TableCell>{display(banner.order)}</TableCell>

            {/*  Position */}
            <TableCell>
              <span className="capitalize">{display(banner.position)}</span>
            </TableCell>

            {/* Status */}
            <StatusCell isActive={banner.isActive} />

            {/*  Timestamps */}
            <TimestampCells
              createdAt={banner.createdAt}
              updatedAt={banner.updatedAt}
            />

            {/*  Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(banner)}
              onDelete={() => handleDelete(banner)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Banner" : "Add Banner"}
        description={
          dialogMode === "edit"
            ? "Update the banner details and media."
            : "Create a new banner for the homepage carousel."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Banner" : "Create Banner"
        }
        className="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {/* Badge */}
            <AdminFormInput
              label="Badge"
              name="badge"
              placeholder="New Arrival"
              value={formData.badge}
              onChange={handleChange}
              disabled={isSubmitting}
              className="col-span-2"
            />

            {/* Label */}
            <AdminFormInput
              label="Label"
              name="label"
              placeholder="Banner Label"
              value={formData.label}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="col-span-2"
            />

            {/* Order */}
            <AdminFormInput
              label="Order"
              name="order"
              type="number"
              min="1"
              placeholder="1"
              value={formData.order}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="col-span-1"
            />
          </div>

          {/* Description */}
          <AdminFormTextarea
            label="Description"
            name="description"
            placeholder="Enter banner description..."
            value={formData.description}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Text Position</Label>
              <Select
                value={formData.position}
                onValueChange={handleValueChange("position")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="position" className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text theme */}
            <div className="space-y-2">
              <Label htmlFor="textTheme">Text Theme</Label>
              <Select
                value={formData.textTheme}
                onValueChange={handleValueChange("textTheme")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="textTheme" className="w-full">
                  <SelectValue placeholder="Select text theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Text</SelectItem>
                  <SelectItem value="dark">Dark Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visibility */}
          <VisibilitySwitch
            checked={formData.isActive}
            onChange={handleValueChange("isActive")}
            disabled={isSubmitting}
          />

          {/* Media Section */}
          <MediaUpload
            label="Banner Attachment"
            preview={filePreview}
            mediaType={formData.mediaType}
            onChange={handleBannerFileChange}
            onRemove={handleBannerFileRemove}
            accept="image/*,video/*"
            description="Image, GIF, or Video (max 10s)"
            disabled={isSubmitting}
          >
            {/* Banner Preview */}
            {filePreview && <BannerPreview formData={formData} />}
          </MediaUpload>

          {/* Buttons */}
          <BannerButtonFields
            formData={formData}
            isSubmitting={isSubmitting}
            handleValueChange={handleValueChange}
            handleNestedChange={handleNestedChange}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={display(selectedItem?.label)}
        title="Delete Banner"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BannerManagement;
