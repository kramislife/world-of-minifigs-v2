import React from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import DeleteDialog from "@/components/table/DeleteDialog";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import useRewardAddonManagement from "@/hooks/admin/useRewardAddonManagement";

const RewardAddonManagement = () => {
  const {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedAddon,
    formData,
    addons,
    totalItems,
    totalPages,
    columns,
    isLoading,
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
  } = useRewardAddonManagement();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reward Add-ons</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage optional items for the Reward Program
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
            <TableCell className="text-success dark:text-accent font-bold">
              ${addon.price?.toFixed(2)}
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
        title={
          dialogMode === "edit" ? "Edit Reward Add-on" : "Add Reward Add-on"
        }
        description={
          dialogMode === "edit"
            ? "Update the reward add-on details."
            : "Add a new item for the Reward Program."
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        submitButtonText={
          dialogMode === "edit" ? "Update Add-on" : "Create Add-on"
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="addonName">Add-on Name</Label>
              <Input
                id="addonName"
                placeholder="e.g., Premium Accessory Pack"
                value={formData.addonName}
                onChange={(e) =>
                  setFormData({ ...formData, addonName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Monthly Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="35.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              {formData.features?.length < 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      features: [...(formData.features || [""]), ""],
                    });
                  }}
                >
                  Add Feature
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {(formData.features || [""]).map((feature, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Textarea
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(formData.features || [""])];
                      newFeatures[index] = e.target.value;
                      setFormData({ ...formData, features: newFeatures });
                    }}
                    rows={2}
                    className="flex-1"
                  />
                  {(formData.features?.length || 1) > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive h-10 w-10"
                      onClick={() => {
                        const newFeatures = (formData.features || [""]).filter(
                          (_, i) => i !== index,
                        );
                        setFormData({
                          ...formData,
                          features: newFeatures.length > 0 ? newFeatures : [""],
                        });
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
              id="addonActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: !!checked })
              }
            />
            <Label htmlFor="addonActive">Active</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedAddon?.addonName || ""}
        title="Delete Reward Add-on"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RewardAddonManagement;
