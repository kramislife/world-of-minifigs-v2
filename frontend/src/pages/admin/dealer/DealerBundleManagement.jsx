import React from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useDealerBundleManagement from "@/hooks/admin/useDealerBundleManagement";

const DealerBundleManagement = () => {
  const {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedBundle,
    formData,
    bundles,
    totalItems,
    totalPages,
    calculatedTotal,
    columns,
    isLoadingBundles,
    isCreating,
    isUpdating,
    isDeleting,
    handleDialogClose,
    setDeleteDialogOpen,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  } = useDealerBundleManagement();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dealer Bundles</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage bulk packs and pricing steps
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Add Bundle
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search bundles..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={bundles}
        isLoading={isLoadingBundles}
        renderRow={(bundle) => (
          <>
            <TableCell maxWidth="200px">{bundle.bundleName}</TableCell>
            <TableCell className="font-semibold">
              {bundle.minifigQuantity}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  bundle.torsoBagType === "custom" ? "accent" : "outline"
                }
              >
                {bundle.torsoBagType === "custom" ? "Custom" : "Regular"}
              </Badge>
            </TableCell>
            <TableCell className="font-semibold">
              ${bundle.unitPrice?.toFixed(2)}
            </TableCell>
            <TableCell className="font-semibold text-success">
              ${bundle.totalPrice?.toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge variant={bundle.isActive ? "success" : "destructive"}>
                {bundle.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {bundle.createdAt
                ? new Date(bundle.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {bundle.updatedAt
                ? new Date(bundle.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(bundle)}
              onDelete={() => handleDelete(bundle)}
            />
          </>
        )}
      />

      {/* Add/Update Bundle Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Bundle" : "Add New Bundle"}
        description={
          dialogMode === "edit"
            ? "Update the bundle details."
            : "Create a new bundle for your products."
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        submitButtonText={
          dialogMode === "edit" ? "Update Bundle" : "Create Bundle"
        }
        className="sm:max-w-3xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bundleName">Bundle Name</Label>
            <Input
              id="bundleName"
              placeholder="100 Minifigs"
              value={formData.bundleName}
              onChange={(e) =>
                setFormData({ ...formData, bundleName: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="100"
                value={formData.minifigQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minifigQuantity: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                placeholder="2.10"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="torsoBagType">Torso Bag Type</Label>
              <Select
                value={formData.torsoBagType}
                onValueChange={(value) =>
                  setFormData({ ...formData, torsoBagType: value })
                }
              >
                <SelectTrigger id="torsoBagType" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="custom">Custom Bundle</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.torsoBagType === "regular"
                  ? "Uses base bags with a quantity (e.g. 200 = 2× 100 bag)."
                  : "Uses a dedicated bag set for this bundle."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              {formData.features.length < 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      features: [...formData.features, ""],
                    });
                  }}
                >
                  Add Feature
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Textarea
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[index] = e.target.value;
                      setFormData({ ...formData, features: newFeatures });
                    }}
                    rows={2}
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive h-10 w-10"
                      onClick={() => {
                        const newFeatures = formData.features.filter(
                          (_, i) => i !== index,
                        );
                        setFormData({ ...formData, features: newFeatures });
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-sm">Calculated Total Cost:</span>
            <span className="text-lg text-success dark:text-accent">
              ${calculatedTotal}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="bundleActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="bundleActive">Available to Dealers</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedBundle?.bundleName || ""}
        title="Delete Bundle"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerBundleManagement;
