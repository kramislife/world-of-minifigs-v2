import React from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import useDealerExtraBagManagement from "@/hooks/admin/useDealerExtraBagManagement";

const DealerExtraBagManagement = () => {
  const {
    search,
    limit,
    page,
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedBag,
    formData,
    subCollections,
    extraBags,
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
  } = useDealerExtraBagManagement();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extra Part Bags</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Configure pricing for additional part bags in Step 3
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Set Bag Price
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
        data={extraBags}
        isLoading={isLoading}
        renderRow={(bag) => (
          <>
            <TableCell maxWidth="200px">
              {bag.subCollectionId?.subCollectionName}
            </TableCell>
            <TableCell className="font-bold text-success dark:text-accent">
              ${bag.price?.toFixed(2)}
            </TableCell>
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

      {/* Add/Edit Extra Bag Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title="Extra Bag Pricing"
        description={
          dialogMode === "edit"
            ? "Update the extra bag details."
            : "Create a new extra bag for your products."
        }
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        submitButtonText={
          dialogMode === "edit" ? "Update Extra Bag" : "Create Extra Bag"
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.subCollectionId}
              onValueChange={(v) =>
                setFormData({ ...formData, subCollectionId: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Sub-Collection" />
              </SelectTrigger>
              <SelectContent>
                {subCollections.map((sc) => (
                  <SelectItem key={sc._id} value={sc._id}>
                    {sc.subCollectionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="50.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="extraBagActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="extraBagActive">Available to Dealers</Label>
          </div>
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={`${selectedBag?.subCollectionId?.subCollectionName || ""} Pricing`}
        title="Delete Bag Pricing"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerExtraBagManagement;
