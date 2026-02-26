import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetCollectionsQuery,
  useGetSubCollectionsQuery,
  useGetColorsQuery,
  useGetSkillLevelsQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
import {
  validateProduct,
  validateMinItems,
  handleFileReadError,
} from "@/utils/validation";
import useMediaPreview from "@/hooks/admin/useMediaPreview";
import { validateFile, readFileAsDataURL } from "@/utils/fileHelpers";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  productName: "",
  partId: "",
  itemId: "",
  price: "",
  discount: "",
  descriptions: [""],
  images: [],
  categoryIds: [],
  subCategoryIds: [],
  collectionIds: [],
  subCollectionIds: [],
  pieceCount: "",
  length: "",
  width: "",
  height: "",
  colorId: "",
  secondaryColorId: "",
  showSecondaryColor: false,
  skillLevelIds: [],
  stock: "",
  isActive: true,
};

const defaultVariant = {
  colorId: "",
  secondaryColorId: "",
  showSecondaryColor: false,
  itemId: "",
  stock: "",
  image: "",
  imagePreview: "",
};

const columns = [
  { key: "productName", label: "Product Name" },
  { key: "productType", label: "Type" },
  { key: "price", label: "Price" },
  { key: "discount", label: "Discount" },
  { key: "discountPrice", label: "Discount Price" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useProductManagement = () => {
  const [productType, setProductType] = useState("standalone");
  const [variants, setVariants] = useState([{ ...defaultVariant }]);
  const [imagesChanged, setImagesChanged] = useState(false);

  // Gallery hook for standalone products
  const {
    filePreview: galleryPreviews,
    setFilePreview: setGalleryPreviews,
    fileInputRef,
    resetFile,
    handleFileChange: onGalleryChange,
    handleRemoveFile: onGalleryRemove,
  } = useMediaPreview({ multiple: true, maxFiles: 10 });

  const resetProductState = useCallback(() => {
    setProductType("standalone");
    setVariants([{ ...defaultVariant }]);
    resetFile();
    setImagesChanged(false);
  }, [resetFile]);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createProduct,
    updateFn: updateProduct,
    deleteFn: deleteProduct,
    entityName: "product",
    onReset: resetProductState,
  });

  // Fetch data
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: subCategoriesData } = useGetSubCategoriesQuery();
  const { data: collectionsData } = useGetCollectionsQuery();
  const { data: subCollectionsData } = useGetSubCollectionsQuery();
  const { data: colorsData } = useGetColorsQuery();
  const { data: skillLevelsData } = useGetSkillLevelsQuery();

  const {
    items: products,
    totalItems,
    totalPages,
  } = extractPaginatedData(productsData, "products");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  // Option lists
  const categories = categoriesData?.categories || [];
  const subCategories = subCategoriesData?.subCategories || [];
  const collections = collectionsData?.collections || [];
  const subCollections = subCollectionsData?.subCollections || [];
  const colors = useMemo(() => {
    const colorsList = colorsData?.colors || [];
    return [...colorsList].sort((a, b) =>
      (a.colorName || "").localeCompare(b.colorName || ""),
    );
  }, [colorsData]);
  const skillLevels = skillLevelsData?.skillLevels || [];

  // Group sub-categories by category
  const categoriesWithSubs = useMemo(() => {
    return categories.map((category) => {
      const categoryId = category._id || category.id;
      const subs = subCategories.filter(
        (sub) => (sub.categoryId?._id || sub.categoryId) === categoryId,
      );
      return { ...category, subCategories: subs };
    });
  }, [categories, subCategories]);

  // Group sub-collections by collection
  const collectionsWithSubs = useMemo(() => {
    return collections.map((collection) => {
      const collectionId = collection._id || collection.id;
      const subs = subCollections.filter(
        (sub) => (sub.collectionId?._id || sub.collectionId) === collectionId,
      );
      return { ...collection, subCollections: subs };
    });
  }, [collections, subCollections]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleSelectChange = (name, value) => {
    crud.setFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleMultiSelectChange = (name, value) => {
    crud.setFormData((prev) => {
      const currentValues = prev[name] || [];
      const isSelected = currentValues.includes(value);
      return {
        ...prev,
        [name]: isSelected
          ? currentValues.filter((id) => id !== value)
          : [...currentValues, value],
      };
    });
  };

  // Image handlers for standalone gallery
  const handleImageChange = async (e) => {
    const dataUrls = await onGalleryChange(e);
    if (dataUrls && dataUrls.length > 0) {
      crud.setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...dataUrls],
      }));
      setImagesChanged(true);
    }
  };

  const handleRemoveImage = (index) => {
    onGalleryRemove(index);
    crud.setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagesChanged(true);
  };

  // Variant handlers
  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { ...defaultVariant }]);
  };

  const handleRemoveVariant = (index) => {
    if (validateMinItems(variants, 1, "variant")) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const newVariants = [...prev];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return newVariants;
    });
  };

  const handleVariantImageChange = async (variantIndex, e) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    try {
      const dataUrl = await readFileAsDataURL(file);
      setVariants((prev) => {
        const newVariants = [...prev];
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          imagePreview: dataUrl,
          image: dataUrl,
        };
        return newVariants;
      });
    } catch (error) {
      handleFileReadError();
    }
  };

  const handleRemoveVariantImage = (variantIndex) => {
    setVariants((prev) => {
      const newVariants = [...prev];
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        imagePreview: "",
        image: "",
      };
      return newVariants;
    });
  };

  // Edit handler (complex — sets product type, variants, images)
  const handleEdit = (product) => {
    const existingDescriptions =
      product.descriptions && product.descriptions.length > 0
        ? product.descriptions.filter((d) => d)
        : [""];

    const hasSecondaryColor = !!(
      product.secondaryColorId?._id || product.secondaryColorId
    );

    const mappedForm = {
      productName: product.productName || "",
      partId: product.partId || "",
      itemId: product.itemId || "",
      price: product.price || "",
      discount: product.discount || "",
      descriptions:
        existingDescriptions.length > 0 ? existingDescriptions : [""],
      images: [],
      categoryIds:
        product.categoryIds?.map((c) => c._id || c) ||
        product.categoryIds ||
        [],
      subCategoryIds:
        product.subCategoryIds?.map((sc) => sc._id || sc) ||
        product.subCategoryIds ||
        [],
      collectionIds:
        product.collectionIds?.map((c) => c._id || c) ||
        product.collectionIds ||
        [],
      subCollectionIds:
        product.subCollectionIds?.map((sc) => sc._id || sc) ||
        product.subCollectionIds ||
        [],
      pieceCount: product.pieceCount || "",
      length: product.length || "",
      width: product.width || "",
      height: product.height || "",
      colorId: product.colorId?._id || product.colorId || "",
      secondaryColorId:
        product.secondaryColorId?._id || product.secondaryColorId || "",
      showSecondaryColor: hasSecondaryColor,
      skillLevelIds:
        product.skillLevelIds?.map((sl) => sl._id || sl) ||
        product.skillLevelIds ||
        [],
      stock: product.stock || "",
      isActive: product.isActive !== undefined ? product.isActive : true,
    };

    crud.openEdit(product, mappedForm);

    // Set images
    const existingImages = product.images?.map((img) => img.url) || [];
    setGalleryPreviews(existingImages);
    const existingImageObjects =
      product.images?.map((img) => ({
        publicId: img.publicId,
        url: img.url,
      })) || [];
    crud.setFormData((prev) => ({ ...prev, images: existingImageObjects }));
    setImagesChanged(false);

    // Set variants / product type
    if (product.variants && product.variants.length > 0) {
      setProductType("variant");
      crud.setFormData((prev) => ({ ...prev, partId: product.partId || "" }));
      const variantData = product.variants.map((variant) => {
        const variantHasSecondary = !!(
          variant.secondaryColorId?._id || variant.secondaryColorId
        );
        return {
          colorId: variant.colorId?._id || variant.colorId || "",
          secondaryColorId:
            variant.secondaryColorId?._id || variant.secondaryColorId || "",
          showSecondaryColor: variantHasSecondary,
          itemId: variant.itemId || "",
          stock: variant.stock || "",
          image: variant.image
            ? { publicId: variant.image.publicId, url: variant.image.url }
            : "",
          imagePreview: variant.image?.url || "",
        };
      });
      setVariants(
        variantData.length > 0 ? variantData : [{ ...defaultVariant }],
      );
    } else {
      setProductType("standalone");
      setVariants([{ ...defaultVariant }]);
    }
  };

  // Submit handler (complex — builds product-specific payload)
  const handleSubmit = async () => {
    if (!validateProduct(crud.formData, productType, variants, galleryPreviews))
      return;

    const validDescriptions = crud.formData.descriptions
      .map((d) => sanitizeString(d))
      .filter(Boolean);

    const productData = {
      productName: sanitizeString(crud.formData.productName),
      price: Number(crud.formData.price),
      descriptions: validDescriptions.slice(0, 3),
      isActive: crud.formData.isActive,
    };

    // Product type specific fields
    if (productType === "standalone") {
      productData.productType = "standalone";
      productData.partId = sanitizeString(crud.formData.partId);
      productData.itemId = sanitizeString(crud.formData.itemId);
      productData.images = crud.formData.images;

      if (crud.formData.colorId) productData.colorId = crud.formData.colorId;

      if (crud.formData.secondaryColorId)
        productData.secondaryColorId = crud.formData.secondaryColorId;

      if (crud.formData.stock !== "")
        productData.stock = Number(crud.formData.stock) || 0;
    }

    if (productType === "variant") {
      productData.productType = "variant";
      productData.partId = sanitizeString(crud.formData.partId);

      productData.variants = variants.map((variant) => ({
        colorId: variant.colorId,
        ...(variant.secondaryColorId && {
          secondaryColorId: variant.secondaryColorId,
        }),
        itemId: sanitizeString(variant.itemId),
        stock: Number(variant.stock) || 0,
        image: variant.image || null,
      }));
    }

    // Optional numeric & relational fields
    if (crud.formData.discount !== "")
      productData.discount = Number(crud.formData.discount);

    if (crud.formData.categoryIds?.length)
      productData.categoryIds = crud.formData.categoryIds;

    if (crud.formData.subCategoryIds?.length)
      productData.subCategoryIds = crud.formData.subCategoryIds;

    if (crud.formData.collectionIds?.length)
      productData.collectionIds = crud.formData.collectionIds;

    if (crud.formData.subCollectionIds?.length)
      productData.subCollectionIds = crud.formData.subCollectionIds;

    if (crud.formData.pieceCount !== "")
      productData.pieceCount = Number(crud.formData.pieceCount);

    if (crud.formData.length !== "")
      productData.length = Number(crud.formData.length);

    if (crud.formData.width !== "")
      productData.width = Number(crud.formData.width);

    if (crud.formData.height !== "")
      productData.height = Number(crud.formData.height);

    if (crud.formData.skillLevelIds?.length)
      productData.skillLevelIds = crud.formData.skillLevelIds;

    await crud.submitForm(productData);
  };

  return {
    ...crud,
    productType,
    variants,
    imagePreviews: galleryPreviews,
    imagesChanged,
    fileInputRef,
    products,
    totalItems,
    totalPages,
    categories,
    subCategories,
    collections,
    subCollections,
    colors,
    skillLevels,
    categoriesWithSubs,
    collectionsWithSubs,
    columns,
    isLoadingProducts,
    isSubmitting,
    isDeleting,

    // Handlers
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
    handleEdit,
    setProductType,
    setGalleryPreviews,
  };
};

export default useProductManagement;
