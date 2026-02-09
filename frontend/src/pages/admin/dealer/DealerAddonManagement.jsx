import React from "react";
import { Plus, Upload, X } from "lucide-react";
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
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
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
    imagePreviews,
    formData,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fileInputRef,
    colors,
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleImageChange,
    handleUpdateImageMetadata,
    handleRemoveImage,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useDealerAddonManagement();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dealer Add-ons</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage optional premium items for bulk orders
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Add Add-on
        </Button>
      </div>

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
        columns={columns}
        data={addons}
        isLoading={isLoading}
        renderRow={(addon) => (
          <>
            <TableCell maxWidth="200px">{addon.addonName}</TableCell>
            <TableCell maxWidth="300px">{addon.description || "-"}</TableCell>
            <TableCell className="text-success dark:text-accent font-bold">
              {!addon.price || Number(addon.price) === 0
                ? "Free"
                : `$${addon.price?.toFixed(2)}`}
            </TableCell>
            <TableCell>
              <Badge variant={addon.isActive ? "success" : "destructive"}>
                {addon.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {addon.createdAt
                ? new Date(addon.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {addon.updatedAt
                ? new Date(addon.updatedAt).toLocaleString()
                : "-"}
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
        isLoading={isCreating || isUpdating}
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
                imagePreviews.length > 0
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {imagePreviews.map((preview, index) => (
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
                      onClick={() => handleRemoveImage(index)}
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
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
                          handleUpdateImageMetadata(
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
                            handleUpdateImageMetadata(
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
                            handleUpdateImageMetadata(index, "color", value)
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
                  onChange={handleImageChange}
                  disabled={isUpdating || isCreating}
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
