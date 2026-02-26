import React from "react";
import { formatDate } from "@/utils/formatting";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useColorManagement from "@/hooks/admin/useColorManagement";

const ColorManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedColor,
    dialogMode,
    formData,
    page,
    limit,
    search,
    colors,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingColors,
    isSubmitting,
    isDeleting,
    handleChange,
    handleColorPickerChange,
    handleSwitchChange,
    getColorPickerValue,
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
  } = useColorManagement();

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Color Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product colors in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Color
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search colors..."
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
        data={colors}
        isLoading={isLoadingColors}
        renderRow={(color) => (
          <>
            <TableCell maxWidth="200px">{color.colorName}</TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-2">
                {color.hexCode && (
                  <div
                    className="size-5 rounded-md shrink-0"
                    style={{ backgroundColor: color.hexCode }}
                  />
                )}
                <span>{color.hexCode || "-"}</span>
              </div>
            </TableCell>
            <TableCell>
              {color.isActive ? (
                <Badge variant="accent">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {color.createdAt ? formatDate(color.createdAt) : "-"}
            </TableCell>
            <TableCell>
              {color.updatedAt ? formatDate(color.updatedAt) : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(color)}
              onDelete={() => handleDelete(color)}
            />
          </>
        )}
      />

      {/* Add/Edit Color Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Color" : "Add New Color"}
        description={
          dialogMode === "edit"
            ? "Update the color details."
            : "Create a new color for your products."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Color" : "Create Color"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="colorName">Color Name</Label>
          <Input
            id="colorName"
            name="colorName"
            type="text"
            placeholder="e.g., Red, Blue, Forest Green"
            value={formData.colorName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hexCode">Hex Code</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                id="hexCode"
                name="hexCode"
                type="text"
                placeholder="#000000"
                value={formData.hexCode}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <Input
              type="color"
              value={getColorPickerValue()}
              onChange={handleColorPickerChange}
              disabled={isSubmitting}
              className="w-12 p-1 cursor-pointer"
              title="Pick a color"
            />
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Label htmlFor="isActive">Visibility</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When disabled, this color will not appear in product filters or
              public listings
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
        itemName={selectedColor?.colorName || ""}
        title="Delete Color"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ColorManagement;
