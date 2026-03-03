import React from "react";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import {
  AdminFormInput,
  AdminFormTextarea,
} from "@/components/shared/AdminFormInput";
import QuantityControl from "@/components/shared/QuantityControl";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import { formatCurrency, display } from "@/utils/formatting";
import CommonImage from "@/components/shared/CommonImage";
import useDealerAddonManagement from "@/hooks/admin/useDealerAddonManagement";

const DealerAddonManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    addons,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    sortedInventoryItems,
    bundleItems,
    bundleDisplayItems,
    selectedBundleItemIds,
    computedBundlePrice,
    isBundleType,
    isUpgradeType,
    isLoadingAddons,
    isLoadingInventory,
    isSubmitting,
    isDeleting,
    handleChange,
    handleValueChange,
    itemSearch,
    handleItemSearchChange,
    handleToggleBundleItem,
    handleRemoveBundleItem,
    handleBundleItemDecrement,
    handleBundleItemIncrement,
    handleBundleItemQuantityValue,
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
  } = useDealerAddonManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Dealer Add-on Management"
        description="Manage dealer add-ons — bundles from inventory or service upgrades"
        actionLabel="Add Add-on"
        onAction={handleAdd}
      />

      {/* Table Layout */}
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
            {/* Add-on Name */}
            <TableCell maxWidth="200px">{display(addon.addonName)}</TableCell>

            {/* Type */}
            <TableCell className="capitalize">{addon.addonType}</TableCell>

            {/* Description */}
            <TableCell maxWidth="300px">{display(addon.description)}</TableCell>

            {/* Price */}
            <TableCell>
              {addon.price === 0 ? "Free" : formatCurrency(addon.price)}
            </TableCell>

            {/* Status */}
            <StatusCell isActive={addon.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={addon.createdAt}
              updatedAt={addon.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(addon)}
              onDelete={() => handleDelete(addon)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        entityName="Add-on"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        className="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Add-on Name */}
            <AdminFormInput
              label="Add-on Name"
              name="addonName"
              placeholder="Accessories, Animal Pieces"
              value={formData.addonName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.addonType}
                onValueChange={handleValueChange("addonType")}
                disabled={isSubmitting || dialogMode === "edit"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bundle">Bundle</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <AdminFormTextarea
            label="Description"
            name="description"
            placeholder="Enter add-on description..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {isBundleType && (
            <div className="space-y-4">
              {/* Select Items */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Select Items</Label>
                  {selectedBundleItemIds.size > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedBundleItemIds.size} selected
                    </span>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-full"
                    disabled={isSubmitting || isLoadingInventory}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between shadow-none hover:bg-input/50"
                    >
                      Add-ons
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuLabel className="border-b">
                      <div className="flex items-center gap-2">
                        <Search className="size-4 text-muted-foreground shrink-0" />
                        <Input
                          type="text"
                          placeholder="Search items..."
                          value={itemSearch}
                          onChange={handleItemSearchChange}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="h-8 border-0 shadow-none px-2 bg-transparent focus-visible:ring-0"
                          disabled={isSubmitting || isLoadingInventory}
                        />
                      </div>
                    </DropdownMenuLabel>

                    <div className="max-h-60 overflow-y-auto p-1">
                      {isLoadingInventory ? (
                        <div className="p-2 text-sm text-center text-muted-foreground">
                          Loading...
                        </div>
                      ) : sortedInventoryItems.length === 0 ? (
                        <div className="p-2 text-sm text-center text-muted-foreground">
                          No items found
                        </div>
                      ) : (
                        sortedInventoryItems.map((inv) => (
                          <DropdownMenuCheckboxItem
                            key={inv._id}
                            checked={selectedBundleItemIds.has(inv._id)}
                            onCheckedChange={() =>
                              handleToggleBundleItem(inv._id, inv)
                            }
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="size-3 rounded-full shrink-0 border"
                                style={{
                                  backgroundColor:
                                    inv.colorId?.hexCode || "#000",
                                }}
                                title={inv.colorId?.colorName || "No color"}
                              />
                              <span>{inv.minifigName}</span>
                            </div>
                          </DropdownMenuCheckboxItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Adjust Quantities */}
              {bundleItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Quantity per Bag</Label>

                  <div className="rounded-md border divide-y">
                    {bundleDisplayItems.map((item) => {
                      return (
                        <div
                          key={item.inventoryItemId}
                          className="flex items-center gap-3 p-3"
                        >
                          {/* Image */}
                          <CommonImage
                            src={item.inventory.image?.url}
                            alt={item.inventory.minifigName}
                            className="size-12"
                          />

                          {/* Name + Color & Price */}
                          <div className="flex flex-col min-w-0 flex-1 space-y-1">
                            <span className="text-sm font-semibold line-clamp-1">
                              {item.inventory.minifigName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.inventory.colorId?.colorName || "—"}
                              {" · "}
                              <span className="text-success dark:text-accent font-bold">
                                {formatCurrency(item.inventory.price)}
                              </span>
                            </span>
                          </div>

                          {/* Quantity controls */}
                          <QuantityControl
                            value={item.quantityPerBag}
                            onDecrement={() =>
                              handleBundleItemDecrement(item.inventoryItemId)
                            }
                            onIncrement={() =>
                              handleBundleItemIncrement(item.inventoryItemId)
                            }
                            onValueChange={(value) =>
                              handleBundleItemQuantityValue(
                                item.inventoryItemId,
                                value,
                              )
                            }
                            min={1}
                            max={Number(item.inventory.stock || 0)}
                            allowInput
                            valueClassName="w-12"
                          />

                          {/* Remove */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 size-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              handleRemoveBundleItem(item.inventoryItemId)
                            }
                            disabled={isSubmitting}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Computed total price */}
                  <div className="flex justify-end items-center gap-2 pt-2">
                    <span className="text-sm font-medium">Total Price:</span>
                    <span className="text-sm font-bold text-success dark:text-accent">
                      {formatCurrency(computedBundlePrice)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upgrade-specific: Manual price */}
          {isUpgradeType && (
            <AdminFormInput
              label="Price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          )}

          {/* Visibility */}
          <VisibilitySwitch
            checked={formData.isActive}
            onChange={handleValueChange("isActive")}
            disabled={isSubmitting}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={display(selectedItem?.addonName)}
        title="Delete Add-on"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DealerAddonManagement;
