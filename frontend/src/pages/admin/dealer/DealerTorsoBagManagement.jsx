import React, { useMemo } from "react";
import { Plus, Upload, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useDealerTorsoBagManagement from "@/hooks/admin/useDealerTorsoBagManagement";

const DealerTorsoBagManagement = () => {
  const {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedBag,
    itemPreviews,
    formData,
    bags,
    totalItems,
    totalPages,
    columns,
    minRequired,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    currentTotal,
    fileInputRef,
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    handleItemImageChange,
    handleUpdateItemQuantity,
    handleRemoveItem,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useDealerTorsoBagManagement();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Torso Bags</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Group torso designs into selectable themes or bags
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Add Bag
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search bags..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={bags}
        isLoading={isLoading}
        renderRow={(bag) => (
          <>
            <TableCell maxWidth="250px">{bag.bagName}</TableCell>
            <TableCell>{bag.items?.length || 0} Designs</TableCell>
            <TableCell>
              <Badge variant={bag.isActive ? "success" : "destructive"}>
                {bag.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {bag.createdAt ? new Date(bag.createdAt).toLocaleString() : "-"}
            </TableCell>
            <TableCell>
              {bag.updatedAt ? new Date(bag.updatedAt).toLocaleString() : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(bag)}
              onDelete={() => handleDelete(bag)}
            />
          </>
        )}
      />

      {/* Add/Edit Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Torso Bag" : "Add New Bag"}
        description={
          dialogMode === "edit"
            ? "Update the torso bag details and designs."
            : "Define a folder/bag to group your torso designs."
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        submitButtonText={dialogMode === "edit" ? "Update Bag" : "Create Bag"}
        className="sm:max-w-4xl"
      >
        <div className="space-y-5">
          {/* Metadata Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bagName">Bag Name</Label>
              <Input
                id="bagName"
                placeholder="Bag 1001"
                value={formData.bagName}
                onChange={(e) =>
                  setFormData({ ...formData, bagName: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Torso Designs Section */}
          <div className="space-y-3">
            <Label>Torso Designs Attachment</Label>
            <div
              className={`grid gap-4 ${
                itemPreviews.length > 0
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {itemPreviews.map((item, index) => (
                <div
                  key={index}
                  className="relative group border rounded-lg overflow-hidden"
                >
                  <div className="aspect-square relative border-b">
                    <img
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveItem(index)}
                      disabled={isUpdating || isCreating}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  {/* Metadata Overlay/Inputs */}
                  <div className="p-3 space-y-2">
                    <Label className="text-xs font-semibold">
                      Quantity (1 - 4)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="4"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItemQuantity(index, e.target.value)
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}

              <Label
                htmlFor="multi-upload"
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[150px]"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Add designs
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP (5MB max)
                </p>
                <Input
                  id="multi-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleItemImageChange}
                  disabled={isUpdating || isCreating}
                  ref={fileInputRef}
                />
              </Label>
            </div>
          </div>

          {/* Quantity Status Summary */}
          <div className="p-4 rounded-lg border flex">
            <div className="space-y-2 flex-1 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg">{currentTotal}</span>
                <span className="opacity-50">/</span>
                <span className="font-bold">{minRequired}</span>
                <span className="text-xs ml-1">designs configured</span>
                {currentTotal === minRequired ? (
                  <Badge variant="success" className="ml-auto">
                    MATCHED
                  </Badge>
                ) : currentTotal > minRequired ? (
                  <Badge variant="destructive" className="ml-auto">
                    {currentTotal - minRequired} EXCEEDED
                  </Badge>
                ) : (
                  <Badge variant="warning" className="ml-auto">
                    {minRequired - currentTotal} REMAINING
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                * Total quantity of all items must equal the min dealer bundle (
                {minRequired}).
              </p>
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="bagActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: !!checked })
              }
            />
            <Label htmlFor="bagActive">Available to Dealers</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedBag?.bagName || ""}
        title="Delete Torso Bag"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerTorsoBagManagement;
