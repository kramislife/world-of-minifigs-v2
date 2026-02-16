import React from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useRewardBundleManagement from "@/hooks/admin/useRewardBundleManagement";

const RewardBundleManagement = () => {
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
  } = useRewardBundleManagement();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reward Bundles</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage packs for the Reward Program
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

      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={
          dialogMode === "edit" ? "Edit Reward Bundle" : "Add Reward Bundle"
        }
        description={
          dialogMode === "edit"
            ? "Update the reward bundle details."
            : "Create a new reward bundle."
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        submitButtonText={
          dialogMode === "edit" ? "Update Bundle" : "Create Bundle"
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bundleName">Bundle Name</Label>
            <Input
              id="bundleName"
              placeholder="e.g., Starter Pack"
              value={formData.bundleName}
              onChange={(e) =>
                setFormData({ ...formData, bundleName: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (minifig sets)</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                placeholder="30"
                value={formData.minifigQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minifigQuantity: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPrice">Total Price</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                min={0}
                placeholder="100.00"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, totalPrice: e.target.value })
                }
                required
              />
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="bundleActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="bundleActive">Active</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedBundle?.bundleName || ""}
        title="Delete Reward Bundle"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RewardBundleManagement;
