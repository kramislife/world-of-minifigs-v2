import React from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
  PriceCell,
} from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import MediaUpload from "@/components/shared/MediaUpload";
import {
  AdminFormInput,
  AdminFormTextarea,
} from "@/components/shared/AdminFormInput";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import { display } from "@/utils/formatting";
import useProductManagement from "@/hooks/admin/useProductManagement";

const ProductManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    productType,
    variants,
    filePreview,
    products,
    totalItems,
    totalPages,
    startItem,
    endItem,
    columns,
    colors,
    skillLevels,
    categoriesWithSubs,
    collectionsWithSubs,
    isLoadingProducts,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
    handleMultiSelectChange,
    handleDialogClose,
    handleAdd,
    handleDelete,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handlePrevious,
    handleNext,
    setProductType,
    setDeleteDialogOpen,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleImageChange,
    handleRemoveImage,
    handleAddVariant,
    handleRemoveVariant,
    handleVariantChange,
    handleVariantImageChange,
    handleRemoveVariantImage,
    fileInputRef,
    setFormData,
  } = useProductManagement();

  return (
    <div className="space-y-5">
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Product Management"
        description="Manage products in your store"
        actionLabel="Add Product"
        onAction={handleAdd}
      />

      {/* Table Layout */}
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
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
        columns={columns}
        data={products}
        isLoading={isLoadingProducts}
        renderRow={(product) => (
          <>
            {/* Product Name */}
            <TableCell maxWidth="220px" className="font-medium">
              {display(product.productName)}
            </TableCell>

            {/* Product Type */}
            <TableCell className="capitalize">{product.productType}</TableCell>

            {/* Price */}
            <PriceCell amount={product.price} />

            {/* Discount */}
            <TableCell>
              {product.discount > 0 ? `${product.discount}%` : "-"}
            </TableCell>

            {/* Discount Price */}
            <PriceCell amount={product.discountPrice} />

            {/* Status */}
            <StatusCell isActive={product.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={product.createdAt}
              updatedAt={product.updatedAt}
            />

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Product" : "Add Product"}
        description={
          dialogMode === "edit"
            ? "Update the product details and management settings."
            : "Create a new product entry for your catalog."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
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
                disabled={isSubmitting}
                className="flex-1"
              >
                Standalone Product
              </Button>
              <Button
                type="button"
                variant={productType === "variant" ? "default" : "outline"}
                onClick={() => setProductType("variant")}
                disabled={isSubmitting}
                className="flex-1"
              >
                Product with Variants
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            {/* Product Name */}
            <AdminFormInput
              label="Product Name"
              name="productName"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Standalone Product Fields */}
            {productType === "standalone" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <AdminFormInput
                    label="Part ID (Optional)"
                    name="partId"
                    placeholder="123456"
                    value={formData.partId}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <AdminFormInput
                    label="Item ID"
                    name="itemId"
                    placeholder="1234567"
                    value={formData.itemId}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div
                  className={`grid gap-3 ${formData.showSecondaryColor ? "grid-cols-1 sm:grid-cols-5" : "grid-cols-1 sm:grid-cols-4"}`}
                >
                  <AdminFormInput
                    label="Price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  <AdminFormInput
                    label="Discount (%)"
                    name="discount"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.discount}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <AdminFormInput
                    label="Stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
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
                            handleValueChange("showSecondaryColor")(true)
                          }
                          disabled={isSubmitting}
                        >
                          Dual Tone
                        </Button>
                      )}
                    </div>
                    <Select
                      value={formData.colorId}
                      onValueChange={handleValueChange("colorId")}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="colorId" className="w-full">
                        <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color._id} value={color._id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="size-3 rounded-full shrink-0 border"
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

                  {/* Secondary Color */}
                  {formData.showSecondaryColor && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="secondaryColorId">Secondary</Label>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-destructive"
                          onClick={() => {
                            handleValueChange("secondaryColorId")("");
                            handleValueChange("showSecondaryColor")(false);
                          }}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      </div>
                      <Select
                        value={formData.secondaryColorId}
                        onValueChange={handleValueChange("secondaryColorId")}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="secondaryColorId" className="w-full">
                          <SelectValue placeholder="Secondary" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color._id} value={color._id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="size-3 rounded-full shrink-0 border"
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
                <AdminFormInput
                  label="Price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <AdminFormInput
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.discount}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <AdminFormInput
                  label="Part ID (Optional)"
                  name="partId"
                  placeholder="123456"
                  value={formData.partId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
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
                  onClick={addArrayItem("descriptions")}
                  disabled={isSubmitting}
                >
                  Add Description
                </Button>
              )}
            </div>
            {formData.descriptions.map((desc, index) => (
              <div key={index} className="flex gap-3 items-center">
                <AdminFormTextarea
                  name={`description-${index}`}
                  value={desc}
                  onChange={handleArrayChange("descriptions", index)}
                  placeholder="Enter product description..."
                  disabled={isSubmitting}
                  className="flex-1"
                />

                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive h-10 w-10"
                    onClick={removeArrayItem("descriptions", index)}
                    disabled={isSubmitting}
                  >
                    <X className="size-4" />
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
                  disabled={isSubmitting}
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
                        size="icon-sm"
                        onClick={() => handleRemoveVariant(variantIndex)}
                        disabled={isSubmitting || variants.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div
                      className={`grid gap-3 ${variant.showSecondaryColor ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}
                    >
                      {/* Item ID */}
                      <AdminFormInput
                        label="Item ID"
                        name={`variant-itemId-${variantIndex}`}
                        placeholder="1234567"
                        value={variant.itemId}
                        onChange={handleVariantChange(variantIndex, "itemId")}
                        required
                        disabled={isSubmitting}
                      />

                      {/* Stock */}
                      <AdminFormInput
                        label="Stock"
                        name={`variant-stock-${variantIndex}`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={variant.stock}
                        onChange={handleVariantChange(variantIndex, "stock")}
                        disabled={isSubmitting}
                      />

                      {/* Color */}
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
                                )(true)
                              }
                              disabled={isSubmitting}
                            >
                              Dual Tone
                            </Button>
                          )}
                        </div>
                        <Select
                          value={variant.colorId}
                          onValueChange={handleVariantChange(
                            variantIndex,
                            "colorId",
                          )}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id={`variant-colorId-${variantIndex}`}
                            className="w-full"
                          >
                            <SelectValue placeholder="Select Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color._id} value={color._id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="size-3 rounded-full shrink-0 border"
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

                      {variant.showSecondaryColor && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor={`variant-secondaryColorId-${variantIndex}`}
                            >
                              Secondary
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
                                )("");
                                handleVariantChange(
                                  variantIndex,
                                  "showSecondaryColor",
                                )(false);
                              }}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <Select
                            value={variant.secondaryColorId}
                            onValueChange={handleVariantChange(
                              variantIndex,
                              "secondaryColorId",
                            )}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger
                              id={`variant-secondaryColorId-${variantIndex}`}
                              className="w-full"
                            >
                              <SelectValue placeholder="Select secondary" />
                            </SelectTrigger>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem key={color._id} value={color._id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="size-3 rounded-full shrink-0 border"
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
                    <MediaUpload
                      label="Variant Image"
                      preview={variant.imagePreview}
                      onChange={handleVariantImageChange(variantIndex)}
                      onRemove={() => handleRemoveVariantImage(variantIndex)}
                      accept="image/*"
                      description="PNG, JPG, WEBP"
                      imageClassName="h-48 object-contain"
                      disabled={isSubmitting}
                    />
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

                                      const hasAnySub =
                                        category.subCategories.some((s) =>
                                          newSubIds.includes(s._id || s.id),
                                        );

                                      const newCategoryIds = hasAnySub
                                        ? prev.categoryIds.includes(categoryId)
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
                                  disabled={isSubmitting}
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
                              handleMultiSelectChange("categoryIds")(categoryId)
                            }
                            disabled={isSubmitting}
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
              <div className="space-y-3">
                {collectionsWithSubs
                  .filter((collection) => collection.subCollections.length > 0)
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
                                  disabled={isSubmitting}
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
                              handleMultiSelectChange("collectionIds")(
                                collectionId,
                              )
                            }
                            disabled={isSubmitting}
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

          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {/* Piece Count */}
              <AdminFormInput
                label="Piece Count"
                name="pieceCount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.pieceCount}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              {/* Length */}
              <AdminFormInput
                label="Length (cm)"
                name="length"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.length}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              {/* Width */}
              <AdminFormInput
                label="Width (cm)"
                name="width"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.width}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              {/* Height */}
              <AdminFormInput
                label="Height (cm)"
                name="height"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.height}
                onChange={handleChange}
                disabled={isSubmitting}
              />
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
                      handleMultiSelectChange("skillLevelIds")(skillId)
                    }
                    disabled={isSubmitting}
                    className="w-full shadow-none"
                  >
                    {skillLevel.skillLevelName}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Product Images - Only for Standalone Products */}
          {productType === "standalone" && (
            <MediaUpload
              label="Image Attachments"
              multiple
              previews={filePreview}
              onChange={handleImageChange}
              onRemove={handleRemoveImage}
              accept="image/*"
              description="PNG, JPG, WEBP (10 images)"
              previewClassName="aspect-square"
              disabled={isSubmitting}
            />
          )}

          {/* Status */}
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
        itemName={display(selectedItem?.productName)}
        title="Delete Product"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductManagement;
