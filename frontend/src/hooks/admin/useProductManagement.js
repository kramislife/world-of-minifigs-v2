import { useState, useRef, useMemo } from "react";
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

const useProductManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
  const [productType, setProductType] = useState("standalone");
  const [variants, setVariants] = useState([
    {
      colorId: "",
      secondaryColorId: "",
      showSecondaryColor: false,
      itemId: "",
      stock: "",
      image: "",
      imagePreview: "",
    },
  ]);
  const [formData, setFormData] = useState({
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
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesChanged, setImagesChanged] = useState(false);
  const fileInputRef = useRef(null);

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsQuery({
      page,
      limit,
      search: search || undefined,
    });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: subCategoriesData } = useGetSubCategoriesQuery();
  const { data: collectionsData } = useGetCollectionsQuery();
  const { data: subCollectionsData } = useGetSubCollectionsQuery();
  const { data: colorsData } = useGetColorsQuery();
  const { data: skillLevelsData } = useGetSkillLevelsQuery();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Extract data from server response
  const products = productsData?.products || [];
  const totalItems = productsData?.pagination?.totalItems || 0;
  const totalPages = productsData?.pagination?.totalPages || 1;

  // Get options lists
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

  // Column definitions
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => {
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
          setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagesChanged(true);
  };

  // Variant handlers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        colorId: "",
        secondaryColorId: "",
        showSecondaryColor: false,
        itemId: "",
        stock: "",
        image: "",
        imagePreview: "",
      },
    ]);
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
      newVariants[index] = {
        ...newVariants[index],
        [field]: value,
      };
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!formData.descriptions[0]?.trim()) {
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

    try {
      const validDescriptions = formData.descriptions.filter((d) => d.trim());

      const productData = {
        productName: formData.productName.trim(),
        price: parseFloat(formData.price),
        descriptions: validDescriptions.map((d) => d.trim()).slice(0, 3),
        isActive: formData.isActive,
      };

      // Add product type specific fields
      if (productType === "standalone") {
        productData.productType = "standalone";
        productData.partId = formData.partId.trim();
        productData.itemId = formData.itemId.trim();
        productData.images = formData.images;
        if (formData.colorId) {
          productData.colorId = formData.colorId;
        }
        if (formData.secondaryColorId) {
          productData.secondaryColorId = formData.secondaryColorId;
        }
        if (formData.stock !== "") {
          productData.stock = parseInt(formData.stock) || 0;
        }
      } else if (productType === "variant") {
        productData.productType = "variant";
        productData.partId = formData.partId.trim();
        productData.variants = variants.map((variant) => ({
          colorId: variant.colorId,
          secondaryColorId: variant.secondaryColorId || undefined,
          itemId: variant.itemId.trim(),
          stock: parseInt(variant.stock) || 0,
          image: variant.image || null,
        }));
      }

      // Add optional fields
      if (formData.discount) {
        productData.discount = parseFloat(formData.discount);
      }
      if (formData.categoryIds.length > 0) {
        productData.categoryIds = formData.categoryIds;
      }
      if (formData.subCategoryIds.length > 0) {
        productData.subCategoryIds = formData.subCategoryIds;
      }
      if (formData.collectionIds.length > 0) {
        productData.collectionIds = formData.collectionIds;
      }
      if (formData.subCollectionIds.length > 0) {
        productData.subCollectionIds = formData.subCollectionIds;
      }
      if (formData.pieceCount) {
        productData.pieceCount = parseInt(formData.pieceCount);
      }
      if (formData.length) {
        productData.length = parseFloat(formData.length);
      }
      if (formData.width) {
        productData.width = parseFloat(formData.width);
      }
      if (formData.height) {
        productData.height = parseFloat(formData.height);
      }
      if (formData.skillLevelIds.length > 0) {
        productData.skillLevelIds = formData.skillLevelIds;
      }

      if (dialogMode === "edit" && selectedProduct) {
        const productId = selectedProduct._id || selectedProduct.id;
        const response = await updateProduct({
          id: productId,
          ...productData,
        }).unwrap();

        if (response.success) {
          toast.success(response.message || "Product updated successfully", {
            description:
              response.description ||
              `The product "${response.product.productName}" has been updated.`,
          });
          handleDialogClose(false);
        }
      } else {
        const response = await createProduct(productData).unwrap();

        if (response.success) {
          toast.success(response.message || "Product created successfully", {
            description:
              response.description ||
              `The product "${response.product.productName}" has been added.`,
          });
          handleDialogClose(false);
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} product error:`,
        error,
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${dialogMode === "edit" ? "update" : "create"} product`,
        {
          description:
            error?.data?.description ||
            "An unexpected error occurred. Please try again.",
        },
      );
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
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
      });
      setImagePreviews([]);
      setImagesChanged(false);
      setSelectedProduct(null);
      setDialogMode("add");
      setProductType("standalone");
      setVariants([
        {
          colorId: "",
          secondaryColorId: "",
          showSecondaryColor: false,
          itemId: "",
          stock: "",
          image: "",
          imagePreview: "",
        },
      ]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedProduct(null);
    handleDialogClose(true);
  };

  const handleEdit = (product) => {
    setDialogMode("edit");
    setSelectedProduct(product);

    const existingDescriptions =
      product.descriptions && product.descriptions.length > 0
        ? product.descriptions.filter((d) => d)
        : [""];

    const hasSecondaryColor = !!(
      product.secondaryColorId?._id || product.secondaryColorId
    );

    setFormData({
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
    });

    const existingImages = product.images?.map((img) => img.url) || [];
    setImagePreviews(existingImages);

    const existingImageObjects =
      product.images?.map((img) => ({
        publicId: img.publicId,
        url: img.url,
      })) || [];
    setFormData((prev) => ({
      ...prev,
      images: existingImageObjects,
    }));

    setImagesChanged(false);

    if (product.variants && product.variants.length > 0) {
      setProductType("variant");
      // Set partId from product level for variant products
      setFormData((prev) => ({
        ...prev,
        partId: product.partId || "",
      }));
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
            ? {
                publicId: variant.image.publicId,
                url: variant.image.url,
              }
            : "",
          imagePreview: variant.image?.url || "",
        };
      });
      setVariants(
        variantData.length > 0
          ? variantData
          : [
              {
                colorId: "",
                secondaryColorId: "",
                showSecondaryColor: false,
                itemId: "",
                stock: "",
                image: "",
                imagePreview: "",
              },
            ],
      );
    } else {
      setProductType("standalone");
      setVariants([
        {
          colorId: "",
          secondaryColorId: "",
          showSecondaryColor: false,
          itemId: "",
          stock: "",
          image: "",
          imagePreview: "",
        },
      ]);
    }

    setDialogOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const productId = selectedProduct._id || selectedProduct.id;
      const response = await deleteProduct(productId).unwrap();

      if (response.success) {
        toast.success(response.message || "Product deleted successfully", {
          description:
            response.description ||
            `The product "${selectedProduct.productName}" has been removed.`,
        });

        setDeleteDialogOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(error?.data?.message || "Failed to delete product", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return {
    // State
    dialogOpen,
    deleteDialogOpen,
    selectedProduct,
    dialogMode,
    productType,
    variants,
    formData,
    imagePreviews,
    imagesChanged,
    fileInputRef,
    page,
    limit,
    search,
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
  };
};

export default useProductManagement;
