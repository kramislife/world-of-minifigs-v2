import React from "react";
import { Plus, Upload, X, Trash2, TrashIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useProductManagement from "@/hooks/admin/useProductManagement";

const ProductManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedProduct,
    dialogMode,
    productType,
    variants,
    formData,
    imagePreviews,
    fileInputRef,
    page,
    limit,
    search,
    products,
    totalItems,
    totalPages,
    colors,
    skillLevels,
    categoriesWithSubs,
    collectionsWithSubs,
    columns,
    isLoadingProducts,
    isCreating,
    isUpdating,
    isDeleting,
    handleChange,
    handleSelectChange,
    handleMultiSelectChange,
    handleImageChange,
    handleRemoveImage,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantChange,
    handleVariantImageChange,
    handleRemoveVariantImage,
    handleSubmit,
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    setProductType,
    setDeleteDialogOpen,
    setFormData,
  } = useProductManagement();

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage products in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search products..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={products}
        isLoading={isLoadingProducts}
        loadingMessage="Loading products..."
        emptyMessage="No product found..."
        renderRow={(product) => (
          <>
            <TableCell maxWidth="200px" className="font-medium">
              {product.productName}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  product.productType === "variant" ? "secondary" : "accent"
                }
              >
                {product.productType === "variant"
                  ? `Variant (${product.variants?.length || 0})`
                  : "Standalone"}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="font-semibold">
                ${Number(product.price).toFixed(2)}
              </span>
            </TableCell>
            <TableCell>
              {product.discount > 0 ? `${product.discount}%` : "-"}
            </TableCell>
            <TableCell>
              {product.discountPrice ? (
                <Badge variant="success">
                  ${Number(product.discountPrice).toFixed(2)}
                </Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <Badge variant={product.isActive ? "success" : "destructive"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {product.createdAt
                ? new Date(product.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {product.updatedAt
                ? new Date(product.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product)}
            />
          </>
        )}
      />

      {/* Add/Edit Product Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Product" : "Add New Product"}
        description={
          dialogMode === "edit"
            ? "Update the product details."
            : "Create a new product for your store."
        }
        onSubmit={handleSubmit}
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit" ? "Update Product" : "Create Product"
        }
        className="sm:max-w-4xl"
      >
        <div className="space-y-5">
          {/* Product Type Toggle */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={productType === "standalone" ? "default" : "outline"}
                onClick={() => setProductType("standalone")}
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
                className="flex-1"
              >
                Standalone Product
              </Button>
              <Button
                type="button"
                variant={productType === "variant" ? "default" : "outline"}
                onClick={() => setProductType("variant")}
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
                className="flex-1"
              >
                Product with Variants
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                name="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleChange}
                required
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
              />
            </div>

            {/* Standalone Product Fields */}
            {productType === "standalone" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="partId">Part ID (Optional)</Label>
                    <Input
                      id="partId"
                      name="partId"
                      placeholder="Enter part ID"
                      value={formData.partId}
                      onChange={handleChange}
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemId">Item ID</Label>
                    <Input
                      id="itemId"
                      name="itemId"
                      placeholder="Enter item ID"
                      value={formData.itemId}
                      onChange={handleChange}
                      required
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    />
                  </div>
                </div>
                <div
                  className={`grid gap-2 ${formData.showSecondaryColor ? "grid-cols-5" : "grid-cols-4"}`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.discount}
                      onChange={handleChange}
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stock}
                      onChange={handleChange}
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="colorId">Color</Label>
                      {!formData.showSecondaryColor && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              showSecondaryColor: true,
                            }))
                          }
                          disabled={
                            dialogMode === "edit" ? isUpdating : isCreating
                          }
                        >
                          Dual Tone
                        </Button>
                      )}
                    </div>
                    <Select
                      value={formData.colorId || ""}
                      onValueChange={(value) =>
                        handleSelectChange("colorId", value)
                      }
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    >
                      <SelectTrigger id="colorId" className="w-full">
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
                                className="size-4 rounded-md shrink-0"
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

                  {/* Secondary Color (shown when toggle is active) */}
                  {formData.showSecondaryColor && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="secondaryColorId">
                          Secondary Color
                        </Label>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-destructive"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              secondaryColorId: "",
                              showSecondaryColor: false,
                            }))
                          }
                          disabled={
                            dialogMode === "edit" ? isUpdating : isCreating
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <Select
                        value={formData.secondaryColorId || ""}
                        onValueChange={(value) =>
                          handleSelectChange("secondaryColorId", value)
                        }
                        disabled={
                          dialogMode === "edit" ? isUpdating : isCreating
                        }
                      >
                        <SelectTrigger id="secondaryColorId" className="w-full">
                          <SelectValue placeholder="Select secondary color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem
                              key={color._id || color.id}
                              value={color._id || color.id}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="size-4 rounded-md shrink-0"
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
                  )}
                </div>
              </div>
            )}

            {/* Product with Variants - Shared Fields */}
            {productType === "variant" && (
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    disabled={dialogMode === "edit" ? isUpdating : isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.discount}
                    onChange={handleChange}
                    disabled={dialogMode === "edit" ? isUpdating : isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partId">Part ID (Optional)</Label>
                  <Input
                    id="partId"
                    name="partId"
                    placeholder="Enter part ID"
                    value={formData.partId}
                    onChange={handleChange}
                    disabled={dialogMode === "edit" ? isUpdating : isCreating}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Description{formData.descriptions.length > 1 ? "s" : ""}
              </Label>
              {formData.descriptions.length < 3 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      descriptions: [...prev.descriptions, ""],
                    }));
                  }}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                >
                  Add Description
                </Button>
              )}
            </div>
            {formData.descriptions.map((desc, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Textarea
                  id={`description-${index}`}
                  value={desc}
                  onChange={(e) => {
                    const newDescriptions = [...formData.descriptions];
                    newDescriptions[index] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      descriptions: newDescriptions,
                    }));
                  }}
                  placeholder={
                    index === 0
                      ? "Main description (required)"
                      : `Additional description ${index + 1} (optional)`
                  }
                  rows={3}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                  className="flex-1"
                />
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        descriptions: prev.descriptions.filter(
                          (_, i) => i !== index,
                        ),
                      }));
                    }}
                    disabled={dialogMode === "edit" ? isUpdating : isCreating}
                  >
                    <X className="size-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Product Variants Section */}
          {productType === "variant" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Product Variants</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 h-auto"
                  onClick={handleAddVariant}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                >
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, variantIndex) => (
                  <div
                    key={variantIndex}
                    className="border rounded-lg p-4 space-y-4 bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <Label>Variant {variantIndex + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVariant(variantIndex)}
                        disabled={
                          (dialogMode === "edit" ? isUpdating : isCreating) ||
                          variants.length === 1
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div
                      className={`grid gap-2 ${variant.showSecondaryColor ? "grid-cols-4" : "grid-cols-3"}`}
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`variant-itemId-${variantIndex}`}>
                          Item ID
                        </Label>
                        <Input
                          id={`variant-itemId-${variantIndex}`}
                          placeholder="Enter item ID"
                          value={variant.itemId}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "itemId",
                              e.target.value,
                            )
                          }
                          required
                          disabled={
                            dialogMode === "edit" ? isUpdating : isCreating
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`variant-stock-${variantIndex}`}>
                          Stock
                        </Label>
                        <Input
                          id={`variant-stock-${variantIndex}`}
                          type="number"
                          min="0"
                          placeholder="0"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(
                              variantIndex,
                              "stock",
                              e.target.value,
                            )
                          }
                          disabled={
                            dialogMode === "edit" ? isUpdating : isCreating
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`variant-colorId-${variantIndex}`}>
                            Color
                          </Label>
                          {!variant.showSecondaryColor && (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() =>
                                handleVariantChange(
                                  variantIndex,
                                  "showSecondaryColor",
                                  true,
                                )
                              }
                              disabled={
                                dialogMode === "edit" ? isUpdating : isCreating
                              }
                            >
                              Dual Tone
                            </Button>
                          )}
                        </div>
                        <Select
                          value={variant.colorId || ""}
                          onValueChange={(value) =>
                            handleVariantChange(variantIndex, "colorId", value)
                          }
                          disabled={
                            dialogMode === "edit" ? isUpdating : isCreating
                          }
                        >
                          <SelectTrigger
                            id={`variant-colorId-${variantIndex}`}
                            className="w-full"
                          >
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
                                    className="size-4 rounded-md shrink-0"
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

                      {/* Variant Secondary Color (shown when toggle is active) */}
                      {variant.showSecondaryColor && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor={`variant-secondaryColorId-${variantIndex}`}
                            >
                              Secondary Color
                            </Label>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-destructive"
                              onClick={() => {
                                handleVariantChange(
                                  variantIndex,
                                  "secondaryColorId",
                                  "",
                                );
                                handleVariantChange(
                                  variantIndex,
                                  "showSecondaryColor",
                                  false,
                                );
                              }}
                              disabled={
                                dialogMode === "edit" ? isUpdating : isCreating
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <Select
                            value={variant.secondaryColorId || ""}
                            onValueChange={(value) =>
                              handleVariantChange(
                                variantIndex,
                                "secondaryColorId",
                                value,
                              )
                            }
                            disabled={
                              dialogMode === "edit" ? isUpdating : isCreating
                            }
                          >
                            <SelectTrigger
                              id={`variant-secondaryColorId-${variantIndex}`}
                              className="w-full"
                            >
                              <SelectValue placeholder="Select secondary" />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem
                                  key={color._id || color.id}
                                  value={color._id || color.id}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="size-4 rounded-md shrink-0"
                                      style={{
                                        backgroundColor:
                                          color.hexCode || "#000",
                                      }}
                                    />
                                    <span>{color.colorName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Variant Image */}
                    <div className="space-y-3">
                      <Label>Image</Label>
                      <div
                        className={`grid gap-3 ${
                          variant.imagePreview ? "grid-cols-1" : "grid-cols-1"
                        }`}
                      >
                        {variant.imagePreview ? (
                          <div className="relative border rounded-lg overflow-hidden">
                            <img
                              src={variant.imagePreview}
                              alt={`Variant ${variantIndex + 1} image`}
                              className="w-full h-32 object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1"
                              onClick={() =>
                                handleRemoveVariantImage(variantIndex)
                              }
                              disabled={
                                dialogMode === "edit" ? isUpdating : isCreating
                              }
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor={`variant-image-${variantIndex}`}
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-32"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">
                              Click to upload
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP (5MB max)
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`variant-image-${variantIndex}`}
                              onChange={(e) =>
                                handleVariantImageChange(variantIndex, e)
                              }
                              disabled={
                                dialogMode === "edit" ? isUpdating : isCreating
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categories</Label>

            {/* Categories with Sub-categories */}
            {categoriesWithSubs.filter((c) => c.subCategories.length > 0)
              .length > 0 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {categoriesWithSubs
                    .filter((category) => category.subCategories.length > 0)
                    .map((category) => {
                      const categoryId = category._id || category.id;
                      return (
                        <div
                          key={categoryId}
                          className="space-y-2 border rounded-md p-3"
                        >
                          <Label className="pb-2 text-primary dark:text-accent">
                            {category.categoryName}
                          </Label>
                          <div className="grid grid-cols-4 gap-3 pl-2">
                            {category.subCategories.map((sub) => {
                              const subId = sub._id || sub.id;
                              const isChecked =
                                formData.subCategoryIds.includes(subId);
                              return (
                                <div
                                  key={subId}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`subcategory-${subId}`}
                                    checked={isChecked}
                                    onCheckedChange={() => {
                                      setFormData((prev) => {
                                        const newSubIds = isChecked
                                          ? prev.subCategoryIds.filter(
                                              (id) => id !== subId,
                                            )
                                          : [...prev.subCategoryIds, subId];
                                        // Auto-manage parent categoryId
                                        const hasAnySub =
                                          category.subCategories.some((s) =>
                                            newSubIds.includes(s._id || s.id),
                                          );
                                        const newCategoryIds = hasAnySub
                                          ? prev.categoryIds.includes(
                                              categoryId,
                                            )
                                            ? prev.categoryIds
                                            : [...prev.categoryIds, categoryId]
                                          : prev.categoryIds.filter(
                                              (id) => id !== categoryId,
                                            );
                                        return {
                                          ...prev,
                                          subCategoryIds: newSubIds,
                                          categoryIds: newCategoryIds,
                                        };
                                      });
                                    }}
                                    disabled={
                                      dialogMode === "edit"
                                        ? isUpdating
                                        : isCreating
                                    }
                                  />
                                  <Label
                                    htmlFor={`subcategory-${subId}`}
                                    className="cursor-pointer text-sm"
                                  >
                                    {sub.subCategoryName}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Categories without Sub-categories */}
            {categoriesWithSubs.filter((c) => c.subCategories.length === 0)
              .length > 0 && (
              <div className="space-y-3 border rounded-md p-3">
                <div className="grid grid-cols-4 gap-3 pl-2">
                  {categoriesWithSubs
                    .filter((category) => category.subCategories.length === 0)
                    .map((category) => {
                      const categoryId = category._id || category.id;
                      return (
                        <div
                          key={categoryId}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${categoryId}`}
                            checked={formData.categoryIds.includes(categoryId)}
                            onCheckedChange={() =>
                              handleMultiSelectChange("categoryIds", categoryId)
                            }
                            disabled={
                              dialogMode === "edit" ? isUpdating : isCreating
                            }
                          />
                          <Label
                            htmlFor={`category-${categoryId}`}
                            className="cursor-pointer text-sm"
                          >
                            {category.categoryName}
                          </Label>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <Label>Collections</Label>

            {/* Collections with Sub-collections */}
            {collectionsWithSubs.filter((c) => c.subCollections.length > 0)
              .length > 0 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {collectionsWithSubs
                    .filter(
                      (collection) => collection.subCollections.length > 0,
                    )
                    .map((collection) => {
                      const collectionId = collection._id || collection.id;
                      return (
                        <div
                          key={collectionId}
                          className="space-y-2 border rounded-md p-3"
                        >
                          <Label className="pb-2 text-primary dark:text-accent">
                            {collection.collectionName}
                          </Label>
                          <div className="grid grid-cols-4 gap-3 pl-2">
                            {collection.subCollections.map((sub) => {
                              const subId = sub._id || sub.id;
                              const isChecked =
                                formData.subCollectionIds.includes(subId);
                              return (
                                <div
                                  key={subId}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`subcollection-${subId}`}
                                    checked={isChecked}
                                    onCheckedChange={() => {
                                      setFormData((prev) => {
                                        const newSubIds = isChecked
                                          ? prev.subCollectionIds.filter(
                                              (id) => id !== subId,
                                            )
                                          : [...prev.subCollectionIds, subId];
                                        // Auto-manage parent collectionId
                                        const hasAnySub =
                                          collection.subCollections.some((s) =>
                                            newSubIds.includes(s._id || s.id),
                                          );
                                        const newCollectionIds = hasAnySub
                                          ? prev.collectionIds.includes(
                                              collectionId,
                                            )
                                            ? prev.collectionIds
                                            : [
                                                ...prev.collectionIds,
                                                collectionId,
                                              ]
                                          : prev.collectionIds.filter(
                                              (id) => id !== collectionId,
                                            );
                                        return {
                                          ...prev,
                                          subCollectionIds: newSubIds,
                                          collectionIds: newCollectionIds,
                                        };
                                      });
                                    }}
                                    disabled={
                                      dialogMode === "edit"
                                        ? isUpdating
                                        : isCreating
                                    }
                                  />
                                  <Label
                                    htmlFor={`subcollection-${subId}`}
                                    className="cursor-pointer text-sm"
                                  >
                                    {sub.subCollectionName}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Collections without Sub-collections */}
            {collectionsWithSubs.filter((c) => c.subCollections.length === 0)
              .length > 0 && (
              <div className="space-y-3 border rounded-md p-3">
                <div className="grid grid-cols-4 gap-3 pl-2">
                  {collectionsWithSubs
                    .filter(
                      (collection) => collection.subCollections.length === 0,
                    )
                    .map((collection) => {
                      const collectionId = collection._id || collection.id;
                      return (
                        <div
                          key={collectionId}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`collection-${collectionId}`}
                            checked={formData.collectionIds.includes(
                              collectionId,
                            )}
                            onCheckedChange={() =>
                              handleMultiSelectChange(
                                "collectionIds",
                                collectionId,
                              )
                            }
                            disabled={
                              dialogMode === "edit" ? isUpdating : isCreating
                            }
                          />
                          <Label
                            htmlFor={`collection-${collectionId}`}
                            className="cursor-pointer text-sm"
                          >
                            {collection.collectionName}
                          </Label>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Physical Attributes */}
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pieceCount">Piece Count</Label>
                <Input
                  id="pieceCount"
                  name="pieceCount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.pieceCount}
                  onChange={handleChange}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  name="length"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.length}
                  onChange={handleChange}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.width}
                  onChange={handleChange}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.height}
                  onChange={handleChange}
                  disabled={dialogMode === "edit" ? isUpdating : isCreating}
                />
              </div>
            </div>
          </div>

          {/* Skill Levels */}
          <div className="space-y-3">
            <Label>Skill Levels</Label>
            <div className="grid grid-cols-3 gap-3">
              {skillLevels.map((skillLevel) => {
                const skillId = skillLevel._id || skillLevel.id;
                const isSelected = formData.skillLevelIds.includes(skillId);
                return (
                  <Button
                    key={skillId}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleMultiSelectChange("skillLevelIds", skillId)
                    }
                    disabled={dialogMode === "edit" ? isUpdating : isCreating}
                    className="w-full shadow-none"
                  >
                    {skillLevel.skillLevelName}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.isActive ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: true }))
                }
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
                className="w-full shadow-none"
              >
                Active
              </Button>
              <Button
                type="button"
                variant={!formData.isActive ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isActive: false }))
                }
                disabled={dialogMode === "edit" ? isUpdating : isCreating}
                className="w-full shadow-none"
              >
                Inactive
              </Button>
            </div>
          </div>

          {/* Product Images - Only for Standalone Products */}
          {productType === "standalone" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Images</Label>
                <p className="text-xs text-muted-foreground">
                  {imagePreviews.length}/10 images
                </p>
              </div>
              <div
                className={`grid gap-3 ${
                  imagePreviews.length > 0 ? "grid-cols-3" : "grid-cols-1"
                }`}
              >
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative border rounded-lg overflow-hidden aspect-square"
                  >
                    <img
                      src={preview}
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
                ))}
                {imagePreviews.length < 10 && (
                  <Label
                    htmlFor="images"
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-32"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP (5MB max, max 10 images)
                    </p>
                    <Input
                      ref={fileInputRef}
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={dialogMode === "edit" ? isUpdating : isCreating}
                      className="hidden"
                    />
                  </Label>
                )}
              </div>
            </div>
          )}
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedProduct?.productName || ""}
        title="Delete Product"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductManagement;
