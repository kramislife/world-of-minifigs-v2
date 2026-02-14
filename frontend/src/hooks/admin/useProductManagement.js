import { useState, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
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
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

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

const useProductManagement = () => {
  const [productType, setProductType] = useState("standalone");
  const [variants, setVariants] = useState([{ ...defaultVariant }]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesChanged, setImagesChanged] = useState(false);
  const fileInputRef = useRef(null);

  const resetProductState = useCallback(() => {
    setProductType("standalone");
    setVariants([{ ...defaultVariant }]);
    setImagePreviews([]);
    setImagesChanged(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

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

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    crud.setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  // Image handlers
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImageCount = imagePreviews.length;
    const maxImages = 10;

    if (currentImageCount + files.length > maxImages) {
      const allowedCount = maxImages - currentImageCount;
      toast.error("Too many images", {
        description: `You can only add ${allowedCount} more image${
          allowedCount !== 1 ? "s" : ""
        }. Maximum ${maxImages} images allowed.`,
      });
      e.target.value = "";
      return;
    }

    const newPreviews = [];
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        newImages.push(reader.result);

        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
          crud.setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
          }));
          setImagesChanged(true);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    } else {
      toast.error("At least one variant is required");
    }
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const newVariants = [...prev];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return newVariants;
    });
  };

  const handleVariantImageChange = (variantIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setVariants((prev) => {
        const newVariants = [...prev];
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          imagePreview: reader.result,
          image: reader.result,
        };
        return newVariants;
      });
    };
    reader.readAsDataURL(file);
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
    setImagePreviews(existingImages);
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!crud.formData.price || crud.formData.price <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!crud.formData.descriptions[0]?.trim()) {
      toast.error("At least one description is required");
      return;
    }

    // Image validation
    if (productType === "standalone") {
      if (!imagePreviews.length) {
        toast.error("Image is required", {
          description: "Please add at least one product image.",
        });
        return;
      }
    } else if (productType === "variant") {
      const variantWithoutImageIndex = variants.findIndex(
        (variant) => !variant.image && !variant.imagePreview,
      );
      if (variantWithoutImageIndex !== -1) {
        toast.error("Variant image is required", {
          description: `Please add an image for Variant ${
            variantWithoutImageIndex + 1
          }.`,
        });
        return;
      }
    }

    const validDescriptions = crud.formData.descriptions.filter((d) =>
      d.trim(),
    );

    const productData = {
      productName: crud.formData.productName.trim(),
      price: parseFloat(crud.formData.price),
      descriptions: validDescriptions.map((d) => d.trim()).slice(0, 3),
      isActive: crud.formData.isActive,
    };

    // Product type specific fields
    if (productType === "standalone") {
      productData.productType = "standalone";
      productData.partId = crud.formData.partId.trim();
      productData.itemId = crud.formData.itemId.trim();
      productData.images = crud.formData.images;
      if (crud.formData.colorId) productData.colorId = crud.formData.colorId;
      if (crud.formData.secondaryColorId)
        productData.secondaryColorId = crud.formData.secondaryColorId;
      if (crud.formData.stock !== "")
        productData.stock = parseInt(crud.formData.stock) || 0;
    } else if (productType === "variant") {
      productData.productType = "variant";
      productData.partId = crud.formData.partId.trim();
      productData.variants = variants.map((variant) => ({
        colorId: variant.colorId,
        secondaryColorId: variant.secondaryColorId || undefined,
        itemId: variant.itemId.trim(),
        stock: parseInt(variant.stock) || 0,
        image: variant.image || null,
      }));
    }

    // Optional fields
    if (crud.formData.discount)
      productData.discount = parseFloat(crud.formData.discount);
    if (crud.formData.categoryIds.length > 0)
      productData.categoryIds = crud.formData.categoryIds;
    if (crud.formData.subCategoryIds.length > 0)
      productData.subCategoryIds = crud.formData.subCategoryIds;
    if (crud.formData.collectionIds.length > 0)
      productData.collectionIds = crud.formData.collectionIds;
    if (crud.formData.subCollectionIds.length > 0)
      productData.subCollectionIds = crud.formData.subCollectionIds;
    if (crud.formData.pieceCount)
      productData.pieceCount = parseInt(crud.formData.pieceCount);
    if (crud.formData.length)
      productData.length = parseFloat(crud.formData.length);
    if (crud.formData.width)
      productData.width = parseFloat(crud.formData.width);
    if (crud.formData.height)
      productData.height = parseFloat(crud.formData.height);
    if (crud.formData.skillLevelIds.length > 0)
      productData.skillLevelIds = crud.formData.skillLevelIds;

    await crud.submitForm(productData);
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedProduct: crud.selectedItem,
    dialogMode: crud.dialogMode,
    productType,
    variants,
    formData: crud.formData,
    imagePreviews,
    imagesChanged,
    fileInputRef,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
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
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
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
    handleDialogClose: crud.handleDialogClose,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
    setProductType,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
    setFormData: crud.setFormData,
  };
};

export default useProductManagement;
