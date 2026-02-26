import React from "react";
import { formatDate } from "@/utils/formatting";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useBannerManagement from "@/hooks/admin/useBannerManagement";

const BannerManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    mediaPreview,

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
    columns,

    isLoadingBanners,
    isSubmitting,
    isDeleting,

    handleChange,
    handleSelectChange,
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
  } = useBannerManagement();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage homepage banners
          </p>
        </div>

        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Banner
        </Button>
      </div>

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
            <TableCell maxWidth="200px" className="font-medium">
              {banner.label}
            </TableCell>

            <TableCell>
              {banner.badge ? <span>{banner.badge}</span> : "-"}
            </TableCell>

            <TableCell>
              <Badge variant="outline">{banner.order}</Badge>
            </TableCell>

            <TableCell>
              <span className="capitalize">{banner.position}</span>
            </TableCell>

            <TableCell>
              <Badge variant={banner.isActive ? "success" : "destructive"}>
                {banner.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>

            <TableCell>
              {banner.createdAt ? formatDate(banner.createdAt) : "-"}
            </TableCell>

            <TableCell>
              {banner.updatedAt ? formatDate(banner.updatedAt) : "-"}
            </TableCell>

            <ActionsColumn
              onEdit={() => handleEdit(banner)}
              onDelete={() => handleDelete(banner)}
            />
          </>
        )}
      />

      {/* Add/Edit Banner Dialog */}
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="badge">Badge</Label>
              <Input
                id="badge"
                name="badge"
                placeholder="e.g. New Arrival"
                value={formData.badge}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {/* Label */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                placeholder="Main banner title"
                value={formData.label}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            {/* Order */}
            <div className="space-y-2 col-span-1">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="1"
                placeholder="1"
                value={formData.order}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter banner description..."
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Text Position</Label>
              <Select
                value={formData.position}
                onValueChange={(v) => handleSelectChange("position", v)}
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
                onValueChange={(v) => handleSelectChange("textTheme", v)}
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

            {/* Active Status */}
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? "true" : "false"}
                onValueChange={(v) =>
                  handleSelectChange("isActive", v === "true")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="isActive" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-3">
            <Label>Media</Label>

            {mediaPreview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden group">
                <div
                  className={`absolute inset-0 z-10 flex h-full w-full p-5 transition-all duration-300  ${
                    formData.position === "center"
                      ? "items-center justify-center text-center"
                      : formData.position === "bottom-left"
                        ? "items-end justify-start text-left"
                        : "items-end justify-end text-right"
                  } ${
                    formData.textTheme === "dark"
                      ? "text-foreground dark:text-secondary-foreground"
                      : "text-background dark:text-foreground"
                  }`}
                >
                  <div className="max-w-3xl space-y-2">
                    {formData.badge && (
                      <p className="uppercase tracking-widest text-xs">
                        {formData.badge}
                      </p>
                    )}

                    {formData.label && (
                      <h3 className="text-xl sm:text-2xl font-extrabold uppercase leading-tight">
                        {formData.label}
                      </h3>
                    )}

                    {formData.description && (
                      <p className="text-xs line-clamp-2">
                        {formData.description}
                      </p>
                    )}

                    {formData.enableButtons &&
                      formData.buttons?.some((b) => b.label) && (
                        <div
                          className={`flex gap-2 pt-2 ${
                            formData.position === "center"
                              ? "justify-center"
                              : formData.position === "bottom-right"
                                ? "justify-end"
                                : "justify-start"
                          }`}
                        >
                          {formData.buttons
                            .filter((b) => b.label)
                            .map((btn, i) => (
                              <div
                                key={i}
                                className={`px-4 py-2 text-[8px] font-bold uppercase tracking-wider border pointer-events-none transition-all ${
                                  btn.variant === "outline"
                                    ? formData.textTheme === "dark"
                                      ? ""
                                      : ""
                                    : formData.textTheme === "dark"
                                      ? "bg-black border-black text-white"
                                      : "bg-white border-white text-black"
                                }`}
                              >
                                {btn.label}
                              </div>
                            ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Dark Overlay (only for light text) */}
                {formData.textTheme === "light" && (
                  <div className="absolute inset-0 bg-black/20 z-0" />
                )}

                {/* Media Content */}
                {formData.mediaType === "video" ? (
                  <video
                    src={mediaPreview}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                )}

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-32">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Image, GIF, or Video (max 10s)
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          {/* Buttons Section */}
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableButtons"
                checked={formData.enableButtons}
                onCheckedChange={(checked) =>
                  handleSelectChange("enableButtons", checked)
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor="enableButtons"
                className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer mt-0.5"
              >
                Enable Redirect Buttons
              </Label>
            </div>

            {formData.enableButtons && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 mt-3">
                {formData.buttons.map((btn, i) => (
                  <div key={i} className="space-y-3 border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Button {i + 1}
                        {i === 1 && (
                          <span className="text-xs font-normal opacity-70">
                            (Optional)
                          </span>
                        )}
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`btn-label-${i}`} className="text-xs">
                        Button Label
                      </Label>
                      <Input
                        id={`btn-label-${i}`}
                        placeholder="e.g. Shop Now"
                        value={btn.label}
                        onChange={(e) =>
                          handleSelectChange("buttons", {
                            index: i,
                            field: "label",
                            value: e.target.value,
                          })
                        }
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`btn-href-${i}`} className="text-xs">
                        Link URL
                      </Label>
                      <Input
                        id={`btn-href-${i}`}
                        placeholder="/products, /collections..."
                        value={btn.href}
                        onChange={(e) =>
                          handleSelectChange("buttons", {
                            index: i,
                            field: "href",
                            value: e.target.value,
                          })
                        }
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`btn-variant-${i}`} className="text-xs">
                        Visual Style
                      </Label>
                      <Select
                        value={btn.variant || "primary"}
                        onValueChange={(v) =>
                          handleSelectChange("buttons", {
                            index: i,
                            field: "variant",
                            value: v,
                          })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id={`btn-variant-${i}`}
                          className="h-9 w-full"
                        >
                          <SelectValue placeholder="Variant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Solid Button</SelectItem>
                          <SelectItem value="outline">
                            Outline Button
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedItem?.label || ""}
        title="Delete Banner"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BannerManagement;
