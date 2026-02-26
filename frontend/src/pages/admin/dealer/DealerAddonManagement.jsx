import React from "react";
import { formatDate } from "@/utils/formatting";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import { formatCurrency } from "@/utils/formatting";
import useDealerAddonManagement from "@/hooks/admin/useDealerAddonManagement";

const DealerAddonManagement = () => {
  const {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedAddon,
    filePreviews,
    formData,
    addons,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingAddons,
    isSubmitting,
    isDeleting,
    fileInputRef,
    colors,
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFileChange,
    handleUpdateFileMetadata,
    handleRemoveFile,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useDealerAddonManagement();

  return (
    <div className="space-y-5">
      <AdminManagementHeader
        title="Dealer Add-ons"
        description="Manage optional premium items for bulk orders"
        actionLabel="Add Add-on"
        onAction={handleAdd}
      />

      <TableLayout
        searchPlaceholder="Search add-ons..."
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
        data={addons}
        isLoading={isLoadingAddons}
        renderRow={(addon) => (
          <>
            <TableCell maxWidth="200px">{addon.addonName}</TableCell>
            <TableCell maxWidth="300px">{addon.description || "-"}</TableCell>
            <TableCell className="text-success dark:text-accent font-bold">
              {!addon.price || Number(addon.price) === 0
                ? "Free"
                : `$${formatCurrency(addon.price)}`}
            </TableCell>
            <TableCell>
              <Badge variant={addon.isActive ? "success" : "destructive"}>
                {addon.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {addon.createdAt ? formatDate(addon.createdAt) : "-"}
            </TableCell>
            <TableCell>
              {addon.updatedAt ? formatDate(addon.updatedAt) : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(addon)}
              onDelete={() => handleDelete(addon)}
            />
          </>
        )}
      />

      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Add-on" : "Add New Add-on"}
        description={
          dialogMode === "edit"
            ? "Update the add-on details."
            : "Add a new premium item for dealers."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Add-on" : "Create Add-on"
        }
        className="sm:max-w-5xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Add-on Name */}
            <div className="space-y-2">
              <Label htmlFor="addonName">Add-on</Label>
              <Input
                id="addonName"
                placeholder="e.g., Premium Chrome Pack"
                value={formData.addonName}
                onChange={(e) =>
                  setFormData({ ...formData, addonName: e.target.value })
                }
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="20.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what's included in this addon..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Image Attachment */}
          <div className="space-y-3">
            <Label>Image Attachment</Label>
            <div
              className={`grid gap-2 ${
                filePreviews.length > 0
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {filePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group border rounded-lg overflow-hidden"
                >
                  <div className="aspect-square relative border-b">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  {/* Metadata Overlay/Inputs */}
                  <div className="p-2 space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Item Name</Label>
                      <Input
                        placeholder="e.g. Chrome Wings"
                        className="h-9 text-xs"
                        value={preview.itemName}
                        onChange={(e) =>
                          handleUpdateFileMetadata(
                            index,
                            "itemName",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 col-span-1">
                        <Label className="text-xs font-semibold">Price</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="h-9 text-xs w-full"
                          value={preview.itemPrice}
                          onChange={(e) =>
                            handleUpdateFileMetadata(
                              index,
                              "itemPrice",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs font-semibold">Color</Label>
                        <Select
                          value={preview.color || ""}
                          onValueChange={(value) =>
                            handleUpdateFileMetadata(index, "color", value)
                          }
                        >
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem
                                key={color._id || color.id}
                                value={color._id || color.id}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="size-3 rounded-md shrink-0"
                                    style={{
                                      backgroundColor: color.hexCode || "#000",
                                    }}
                                  />
                                  <span>{color.colorName}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Label
                htmlFor="addon-images"
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[150px]"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP (5MB max)
                </p>
                <Input
                  ref={fileInputRef}
                  id="addon-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </Label>
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="addonActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: !!checked })
              }
            />
            <Label htmlFor="addonActive">Available to Dealers</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedAddon?.addonName || ""}
        title="Delete Add-on"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerAddonManagement;
