import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Collection from "../models/collection.model.js";
import SubCollection from "../models/subCollection.model.js";
import Color from "../models/color.model.js";
import SkillLevel from "../models/skillLevel.model.js";
import {
  uploadImage,
  deleteImage,
  validateImage,
} from "../utils/cloudinary.js";
import {
  normalizePagination,
  paginateQuery,
  createPaginationResponse,
} from "../utils/pagination.js";
import {
  buildSortObject,
  buildPublicProductQuery,
  buildProductSearchQuery,
} from "../utils/Products/productQueryBuilder.js";
import {
  processProductsForListing,
  filterProductByType,
  processProductForDetails,
} from "../utils/Products/productProcessor.js";
import {
  getCategoryCounts,
  getCollectionCounts,
  getColorCounts,
  getSkillLevelCounts,
} from "../utils/Products/productCountUtils.js";
import {
  validateForeignKeys,
  checkProductExists,
  checkVariantExists,
  calculateDiscountPrice,
} from "../utils/Products/productValidation.js";
import {
  validatePriceParams,
  validateSortBy,
  validateAndFilterIds,
  validatePublicProductLimit,
} from "../utils/Products/productQueryValidator.js";

//------------------------------------------------ Create Product ------------------------------------------
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productType, // "standalone" or "variant"
      partId,
      itemId,
      price,
      discount,
      description1,
      description2,
      description3,
      images, // For standalone products - array of base64 strings
      categoryIds,
      subCategoryIds,
      collectionIds,
      subCollectionIds,
      pieceCount,
      length,
      width,
      height,
      colorId, // For standalone products
      skillLevelIds,
      stock, // For standalone products
      isActive,
      variants, // Array of variants for productType === "variant"
    } = req.body;

    // Validate required fields
    if (!productName || !productName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
        description: "Please provide a product name.",
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
        description: "Price must be a positive number.",
      });
    }

    if (!description1 || !description1.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
        description: "Please provide at least one description.",
      });
    }

    // Determine product type - use provided productType or infer from variants
    const hasVariants =
      variants && Array.isArray(variants) && variants.length > 0;
    const inferredProductType = hasVariants ? "variant" : "standalone";
    const finalProductType = productType || inferredProductType;

    // Validate productType
    if (finalProductType !== "standalone" && finalProductType !== "variant") {
      return res.status(400).json({
        success: false,
        message: "Invalid product type",
        description: "Product type must be either 'standalone' or 'variant'.",
      });
    }

    const isStandalone = finalProductType === "standalone";

    // Validate standalone product fields
    if (isStandalone) {
      if (!partId || !partId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Part ID is required",
          description: "Part ID is required for standalone products.",
        });
      }

      if (!itemId || !itemId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Item ID is required",
          description: "Item ID is required for standalone products.",
        });
      }

      // Check uniqueness for standalone products
      const existingProduct = await checkProductExists(partId, itemId);

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "Product already exists",
          description:
            "A product with this Part ID and Item ID already exists.",
        });
      }

      // Validate images for standalone
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Images are required",
          description:
            "At least one image is required for standalone products.",
        });
      }

      if (images.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Too many images",
          description: "Maximum 10 images allowed for standalone products.",
        });
      }
    }

    // Validate variants if product has variants
    if (hasVariants) {
      if (variants.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Variants are required",
          description: "At least one variant is required.",
        });
      }

      // Validate each variant
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        if (!variant.colorId) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Color is required`,
            description: "Each variant must have a color.",
          });
        }

        if (!variant.partId || !variant.partId.trim()) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Part ID is required`,
            description: "Each variant must have a Part ID.",
          });
        }

        if (!variant.itemId || !variant.itemId.trim()) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Item ID is required`,
            description: "Each variant must have an Item ID.",
          });
        }

        // Check uniqueness for each variant's partId/itemId combination
        const existingVariantProduct = await checkVariantExists(
          variant.partId,
          variant.itemId,
        );

        if (existingVariantProduct) {
          return res.status(409).json({
            success: false,
            message: "Variant already exists",
            description: `A variant with Part ID "${variant.partId}" and Item ID "${variant.itemId}" already exists.`,
          });
        }

        // Validate variant image (required, single image)
        if (!variant.image) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Image is required`,
            description: "Each variant must have an image.",
          });
        }
      }
    }

    // Validate foreign key references using utility function
    const validationErrors = await validateForeignKeys({
      categoryIds,
      subCategoryIds,
      collectionIds,
      subCollectionIds,
      colorId,
    });

    if (validationErrors.length > 0) {
      const error = validationErrors[0];
      return res.status(400).json({
        success: false,
        message: error.message,
        description: error.description,
      });
    }

    // Upload images for standalone products
    let uploadedImages = [];
    if (isStandalone && images) {
      try {
        for (const image of images) {
          const validation = validateImage(image);
          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              message: "Invalid image",
              description: validation.error,
            });
          }

          const uploadResult = await uploadImage(
            image,
            "world-of-minifigs-v2/products",
          );
          uploadedImages.push({
            publicId: uploadResult.public_id,
            url: uploadResult.url,
          });
        }
      } catch (error) {
        console.error("Image upload error:", error);
        // Clean up any uploaded images
        for (const img of uploadedImages) {
          try {
            await deleteImage(img.publicId);
          } catch (deleteError) {
            console.error("Error deleting image:", deleteError);
          }
        }
        return res.status(500).json({
          success: false,
          message: "Failed to upload images",
          description:
            "An error occurred while uploading images. Please try again.",
        });
      }
    }

    // Process variants and upload their images
    let processedVariants = [];
    if (hasVariants && variants) {
      try {
        for (const variant of variants) {
          let variantImage = null;

          // Upload variant image
          if (variant.image) {
            // Check if it's an existing image (object) or new image (base64 string)
            if (typeof variant.image === "object" && variant.image.publicId) {
              // Existing image
              variantImage = variant.image;
            } else if (typeof variant.image === "string") {
              // New image - upload it
              const validation = validateImage(variant.image);
              if (!validation.isValid) {
                // Clean up any uploaded variant images
                for (const v of processedVariants) {
                  if (v.image && v.image.publicId) {
                    try {
                      await deleteImage(v.image.publicId);
                    } catch (deleteError) {
                      console.error(
                        "Error deleting variant image:",
                        deleteError,
                      );
                    }
                  }
                }
                // Clean up standalone images if any were uploaded
                for (const img of uploadedImages) {
                  try {
                    await deleteImage(img.publicId);
                  } catch (deleteError) {
                    console.error("Error deleting image:", deleteError);
                  }
                }
                return res.status(400).json({
                  success: false,
                  message: "Invalid variant image",
                  description: validation.error,
                });
              }

              const uploadResult = await uploadImage(
                variant.image,
                "world-of-minifigs-v2/products/variants",
              );
              variantImage = {
                publicId: uploadResult.public_id,
                url: uploadResult.url,
              };
            }
          }

          processedVariants.push({
            colorId: variant.colorId,
            partId: variant.partId.trim(),
            itemId: variant.itemId.trim(),
            stock:
              variant.stock !== undefined &&
              variant.stock !== "" &&
              variant.stock !== null
                ? Number(variant.stock)
                : 0,
            image: variantImage,
          });
        }
      } catch (error) {
        console.error("Variant image upload error:", error);
        // Clean up any uploaded variant images
        for (const v of processedVariants) {
          if (v.image && v.image.publicId) {
            try {
              await deleteImage(v.image.publicId);
            } catch (deleteError) {
              console.error("Error deleting variant image:", deleteError);
            }
          }
        }
        // Clean up standalone images if any were uploaded
        for (const img of uploadedImages) {
          try {
            await deleteImage(img.publicId);
          } catch (deleteError) {
            console.error("Error deleting image:", deleteError);
          }
        }
        return res.status(500).json({
          success: false,
          message: "Failed to upload variant images",
          description:
            "An error occurred while uploading variant images. Please try again.",
        });
      }
    }

    // Calculate discount price if discount is provided
    const discountValue =
      discount !== undefined && discount !== null && discount !== ""
        ? Number(discount)
        : 0;
    const discountPrice = calculateDiscountPrice(price, discountValue);

    // Create product
    const productData = {
      productType: finalProductType,
      productName: productName.trim(),
      price: Number(price),
      description1: description1.trim(),
      discount: discountValue,
      discountPrice: discountPrice,
      pieceCount:
        pieceCount !== undefined && pieceCount !== null && pieceCount !== ""
          ? Number(pieceCount)
          : 0,
      length:
        length !== undefined && length !== null && length !== ""
          ? Number(length)
          : 0,
      width:
        width !== undefined && width !== null && width !== ""
          ? Number(width)
          : 0,
      height:
        height !== undefined && height !== null && height !== ""
          ? Number(height)
          : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user._id,
    };

    // Add optional fields
    if (description2 && description2.trim()) {
      productData.description2 = description2.trim();
    }
    if (description3 && description3.trim()) {
      productData.description3 = description3.trim();
    }
    if (categoryIds && categoryIds.length > 0) {
      productData.categoryIds = categoryIds;
    }
    if (subCategoryIds && subCategoryIds.length > 0) {
      productData.subCategoryIds = subCategoryIds;
    }
    if (collectionIds && collectionIds.length > 0) {
      productData.collectionIds = collectionIds;
    }
    if (subCollectionIds && subCollectionIds.length > 0) {
      productData.subCollectionIds = subCollectionIds;
    }

    if (
      skillLevelIds &&
      Array.isArray(skillLevelIds) &&
      skillLevelIds.length > 0
    ) {
      productData.skillLevelIds = skillLevelIds;
    }

    // Add standalone-specific fields
    if (isStandalone) {
      productData.partId = partId.trim();
      productData.itemId = itemId.trim();
      productData.images = uploadedImages;
      if (colorId) {
        productData.colorId = colorId;
      }
      productData.stock =
        stock !== undefined && stock !== null && stock !== ""
          ? Number(stock)
          : 0;
      // Ensure variants is not set for standalone products
      productData.variants = [];
    } else {
      // Add variants and ensure standalone fields are not set
      productData.variants = processedVariants;
      productData.partId = undefined;
      productData.itemId = undefined;
      productData.images = [];
      productData.colorId = undefined;
      productData.stock = undefined;
    }

    const product = await Product.create(productData);

    // Populate references
    await product.populate([
      { path: "categoryIds", select: "categoryName" },
      { path: "subCategoryIds", select: "subCategoryName" },
      { path: "collectionIds", select: "collectionName" },
      { path: "subCollectionIds", select: "subCollectionName" },
      { path: "colorId", select: "colorName hexCode" },
      { path: "skillLevelIds", select: "skillLevelName" },
      { path: "createdBy", select: "firstName lastName username" },
      { path: "variants.colorId", select: "colorName hexCode" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: {
        id: product._id,
        productType: product.productType,
        productName: product.productName,
        price: product.price,
        discount: product.discount,
        discountPrice: product.discountPrice,
        description1: product.description1,
        description2: product.description2,
        description3: product.description3,
        ...(product.productType === "standalone" && {
          partId: product.partId,
          itemId: product.itemId,
          images: product.images,
          colorId: product.colorId,
          stock: product.stock,
        }),
        ...(product.productType === "variant" &&
          product.variants &&
          product.variants.length > 0 && {
            variants: product.variants,
          }),
        categoryIds: product.categoryIds,
        subCategoryIds: product.subCategoryIds,
        collectionIds: product.collectionIds,
        subCollectionIds: product.subCollectionIds,
        pieceCount: product.pieceCount,
        length: product.length,
        width: product.width,
        height: product.height,
        skillLevelIds: product.skillLevelIds,
        isActive: product.isActive,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get All Products ------------------------------------------
export const getAllProducts = async (req, res) => {
  try {
    // Extract and normalize pagination parameters
    const { page, limit, search } = normalizePagination({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });

    // Build search query using utility function
    const searchQuery = await buildProductSearchQuery(search);

    // Apply pagination
    const result = await paginateQuery(Product, searchQuery, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "categoryIds", select: "categoryName" },
        { path: "subCategoryIds", select: "subCategoryName" },
        { path: "collectionIds", select: "collectionName" },
        { path: "subCollectionIds", select: "subCollectionName" },
        { path: "colorId", select: "colorName hexCode" },
        { path: "skillLevelIds", select: "skillLevelName" },
        { path: "createdBy", select: "firstName lastName username" },
        { path: "updatedBy", select: "firstName lastName username" },
        { path: "variants.colorId", select: "colorName hexCode" },
      ],
    });

    // Filter out fields based on productType using utility function
    const processedProducts = result.data.map(filterProductByType);

    return res
      .status(200)
      .json(
        createPaginationResponse(
          { data: processedProducts, pagination: result.pagination },
          "products",
        ),
      );
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get Single Product ------------------------------------------
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        description: "Please provide a valid product ID.",
      });
    }

    const product = await Product.findById(id)
      .select("-__v")
      .populate("categoryIds", "categoryName")
      .populate("subCategoryIds", "subCategoryName")
      .populate("collectionIds", "collectionName")
      .populate("subCollectionIds", "subCollectionName")
      .populate("colorId", "colorName hexCode")
      .populate("skillLevelIds", "skillLevelName")
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username")
      .populate("variants.colorId", "colorName hexCode")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        description: "The requested product does not exist.",
      });
    }

    // Filter out fields based on productType using utility function
    const processedProduct = filterProductByType(product);

    return res.status(200).json({
      success: true,
      product: processedProduct,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Update Product ------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productName,
      productType, // "standalone" or "variant"
      partId,
      itemId,
      price,
      discount,
      description1,
      description2,
      description3,
      images, // For standalone products - array of base64 strings or existing image objects
      categoryIds,
      subCategoryIds,
      collectionIds,
      subCollectionIds,
      pieceCount,
      length,
      width,
      height,
      colorId,
      skillLevelIds,
      stock,
      isActive,
      variants,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        description: "Please provide a valid product ID.",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        description: "The requested product does not exist.",
      });
    }

    // Determine product type - use provided productType or infer from variants
    const hasVariants =
      variants && Array.isArray(variants) && variants.length > 0;
    const inferredProductType = hasVariants
      ? "variant"
      : product.variants?.length > 0
        ? "variant"
        : "standalone";
    const finalProductType = productType || inferredProductType;

    // Validate productType if provided
    if (
      productType &&
      productType !== "standalone" &&
      productType !== "variant"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product type",
        description: "Product type must be either 'standalone' or 'variant'.",
      });
    }

    const isStandalone = finalProductType === "standalone";
    const isChangingToVariants =
      finalProductType === "variant" && product.productType === "standalone";
    const isChangingToStandalone =
      finalProductType === "standalone" && product.productType === "variant";

    // Validate required fields
    if (productName !== undefined && !productName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
        description: "Please provide a product name.",
      });
    }

    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
        description: "Price must be a positive number.",
      });
    }

    if (description1 !== undefined && !description1.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
        description: "Please provide at least one description.",
      });
    }

    // Validate standalone product fields if switching to standalone or updating standalone
    if (isStandalone || isChangingToStandalone) {
      if (partId !== undefined && (!partId || !partId.trim())) {
        return res.status(400).json({
          success: false,
          message: "Part ID is required",
          description: "Part ID is required for standalone products.",
        });
      }

      if (itemId !== undefined && (!itemId || !itemId.trim())) {
        return res.status(400).json({
          success: false,
          message: "Item ID is required",
          description: "Item ID is required for standalone products.",
        });
      }

      // Check uniqueness if partId or itemId is being changed
      if (partId || itemId) {
        const checkPartId = partId ? partId.trim() : product.partId;
        const checkItemId = itemId ? itemId.trim() : product.itemId;

        const existingProduct = await checkProductExists(
          checkPartId,
          checkItemId,
          id,
        );

        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message: "Product already exists",
            description:
              "A product with this Part ID and Item ID already exists.",
          });
        }
      }
    }

    // Validate variants if product has variants
    if (hasVariants || product.variants?.length) {
      const variantsToValidate = hasVariants ? variants : product.variants;

      if (variantsToValidate.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Variants are required",
          description: "At least one variant is required.",
        });
      }

      // Validate each variant
      for (let i = 0; i < variantsToValidate.length; i++) {
        const variant = variantsToValidate[i];

        if (!variant.colorId) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Color is required`,
            description: "Each variant must have a color.",
          });
        }

        if (!variant.partId || !variant.partId.trim()) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Part ID is required`,
            description: "Each variant must have a Part ID.",
          });
        }

        if (!variant.itemId || !variant.itemId.trim()) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1}: Item ID is required`,
            description: "Each variant must have an Item ID.",
          });
        }

        // Check uniqueness for variant partId/itemId (excluding current product)
        const existingVariantProduct = await checkVariantExists(
          variant.partId,
          variant.itemId,
          id,
        );

        if (existingVariantProduct) {
          return res.status(409).json({
            success: false,
            message: "Variant already exists",
            description: `A variant with Part ID "${variant.partId}" and Item ID "${variant.itemId}" already exists.`,
          });
        }
      }
    }

    // Handle image updates for standalone products
    let uploadedImages = [];
    let imagesToDelete = [];

    if (isStandalone && images) {
      // Separate existing images (objects with publicId) from new images (base64 strings)
      const existingImages = images.filter(
        (img) => typeof img === "object" && img.publicId,
      );
      const newImages = images.filter((img) => typeof img === "string");

      // Find images to delete (images that were in product but not in the update)
      if (product.images && product.images.length > 0) {
        imagesToDelete = product.images.filter(
          (existingImg) =>
            !existingImages.some(
              (img) => img.publicId === existingImg.publicId.toString(),
            ),
        );
      }

      // Upload new images
      if (newImages.length > 0) {
        try {
          for (const image of newImages) {
            const validation = validateImage(image);
            if (!validation.isValid) {
              return res.status(400).json({
                success: false,
                message: "Invalid image",
                description: validation.error,
              });
            }

            const uploadResult = await uploadImage(
              image,
              "world-of-minifigs-v2/products",
            );
            uploadedImages.push({
              publicId: uploadResult.public_id,
              url: uploadResult.url,
            });
          }
        } catch (error) {
          console.error("Image upload error:", error);
          // Clean up uploaded images
          for (const img of uploadedImages) {
            try {
              await deleteImage(img.publicId);
            } catch (deleteError) {
              console.error("Error deleting image:", deleteError);
            }
          }
          return res.status(500).json({
            success: false,
            message: "Failed to upload images",
            description:
              "An error occurred while uploading images. Please try again.",
          });
        }
      }

      // Combine existing and new images
      uploadedImages = [...existingImages, ...uploadedImages];
    }

    // Handle variant image updates
    let processedVariants = [];
    let variantImagesToDelete = [];

    if (hasVariants || product.variants?.length) {
      const variantsToProcess = hasVariants ? variants : product.variants;

      // Collect old variant images for deletion if switching types
      if (isChangingToVariants && product.images && product.images.length > 0) {
        variantImagesToDelete = [...product.images];
      }

      try {
        for (let i = 0; i < variantsToProcess.length; i++) {
          const variant = variantsToProcess[i];
          let variantImage = null;

          // Handle variant image (single image)
          if (variant.image) {
            // Check if it's an existing image (object) or new image (base64 string)
            if (typeof variant.image === "object" && variant.image.publicId) {
              // Existing image
              variantImage = variant.image;
            } else if (typeof variant.image === "string") {
              // New image - upload it
              const validation = validateImage(variant.image);
              if (!validation.isValid) {
                // Clean up any uploaded variant images
                for (const v of processedVariants) {
                  if (v.image && v.image.publicId) {
                    try {
                      await deleteImage(v.image.publicId);
                    } catch (deleteError) {
                      console.error(
                        "Error deleting variant image:",
                        deleteError,
                      );
                    }
                  }
                }
                return res.status(400).json({
                  success: false,
                  message: `Variant ${i + 1}: Invalid image`,
                  description: validation.error,
                });
              }

              const uploadResult = await uploadImage(
                variant.image,
                "world-of-minifigs-v2/products/variants",
              );
              variantImage = {
                publicId: uploadResult.public_id,
                url: uploadResult.url,
              };
            }
          }

          // Find old variant image to delete if it's being replaced
          if (product.variants && product.variants[i]) {
            const oldVariant = product.variants[i];
            if (oldVariant.image && oldVariant.image.publicId) {
              const oldImage = oldVariant.image;
              const isImageKept =
                variantImage &&
                variantImage.publicId === oldImage.publicId.toString();
              if (!isImageKept) {
                variantImagesToDelete.push(oldImage);
              }
            }
          }

          processedVariants.push({
            colorId: variant.colorId,
            partId: variant.partId.trim(),
            itemId: variant.itemId.trim(),
            stock:
              variant.stock !== undefined &&
              variant.stock !== "" &&
              variant.stock !== null
                ? Number(variant.stock)
                : 0,
            image: variantImage,
          });
        }
      } catch (error) {
        console.error("Variant image upload error:", error);
        // Clean up uploaded variant images
        for (const v of processedVariants) {
          if (v.image && v.image.publicId) {
            try {
              await deleteImage(v.image.publicId);
            } catch (deleteError) {
              console.error("Error deleting variant image:", deleteError);
            }
          }
        }
        return res.status(500).json({
          success: false,
          message: "Failed to upload variant images",
          description:
            "An error occurred while uploading variant images. Please try again.",
        });
      }
    }

    // Calculate discount price if discount is provided
    let discountPrice = product.discountPrice;
    if (discount !== undefined) {
      const finalPrice = price !== undefined ? price : product.price;
      discountPrice = calculateDiscountPrice(finalPrice, discount);
    } else if (price !== undefined && product.discount) {
      discountPrice = calculateDiscountPrice(price, product.discount);
    }

    // Update product fields
    if (productType !== undefined) {
      product.productType = finalProductType;
    }
    if (productName !== undefined) {
      product.productName = productName.trim();
    }
    if (price !== undefined) {
      product.price = Number(price);
    }
    if (discount !== undefined) {
      product.discount = discount > 0 ? Number(discount) : null;
      product.discountPrice = discountPrice;
    }
    if (description1 !== undefined) {
      product.description1 = description1.trim();
    }
    if (description2 !== undefined) {
      product.description2 = description2.trim() || null;
    }
    if (description3 !== undefined) {
      product.description3 = description3.trim() || null;
    }
    if (categoryIds !== undefined) {
      product.categoryIds = categoryIds;
    }
    if (subCategoryIds !== undefined) {
      product.subCategoryIds = subCategoryIds;
    }
    if (collectionIds !== undefined) {
      product.collectionIds = collectionIds;
    }
    if (subCollectionIds !== undefined) {
      product.subCollectionIds = subCollectionIds;
    }
    if (pieceCount !== undefined) {
      product.pieceCount = pieceCount !== null ? Number(pieceCount) : null;
    }
    if (length !== undefined) {
      product.length = length !== null ? Number(length) : null;
    }
    if (width !== undefined) {
      product.width = width !== null ? Number(width) : null;
    }
    if (height !== undefined) {
      product.height = height !== null ? Number(height) : null;
    }
    if (skillLevelIds !== undefined) {
      product.skillLevelIds = skillLevelIds;
    }
    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }
    product.updatedBy = req.user._id;

    // Handle standalone-specific fields
    if (isStandalone || isChangingToStandalone) {
      if (partId !== undefined) {
        product.partId = partId.trim();
      }
      if (itemId !== undefined) {
        product.itemId = itemId.trim();
      }
      if (images !== undefined) {
        product.images = uploadedImages;
      }
      if (colorId !== undefined) {
        product.colorId = colorId || null;
      }
      if (stock !== undefined) {
        product.stock = Number(stock);
      }
      // Clear variants if switching to standalone
      if (isChangingToStandalone) {
        // Delete old variant images
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            if (variant.image && variant.image.publicId) {
              try {
                await deleteImage(variant.image.publicId);
              } catch (deleteError) {
                console.error("Error deleting variant image:", deleteError);
              }
            }
          }
        }
        product.variants = [];
      }
    }

    // Handle variant-specific fields
    if (hasVariants || product.variants?.length) {
      if (variants !== undefined) {
        product.variants = processedVariants;
      }
      // Clear standalone fields if switching to variants or if product has variants
      if (isChangingToVariants || (hasVariants && !isChangingToStandalone)) {
        // Delete old standalone images
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            try {
              await deleteImage(img.publicId);
            } catch (deleteError) {
              console.error("Error deleting image:", deleteError);
            }
          }
        }
        product.partId = undefined;
        product.itemId = undefined;
        product.images = [];
        product.colorId = undefined;
        product.stock = undefined;
      }
    } else if (isStandalone || isChangingToStandalone) {
      // Ensure variants is empty for standalone products
      if (!product.variants || product.variants.length === 0) {
        product.variants = [];
      }
    }

    await product.save();

    // Delete old images that are no longer needed
    for (const img of imagesToDelete) {
      try {
        await deleteImage(img.publicId);
      } catch (deleteError) {
        console.error("Error deleting image:", deleteError);
      }
    }

    for (const img of variantImagesToDelete) {
      try {
        await deleteImage(img.publicId);
      } catch (deleteError) {
        console.error("Error deleting variant image:", deleteError);
      }
    }

    // Populate references
    await product.populate([
      { path: "categoryIds", select: "categoryName" },
      { path: "subCategoryIds", select: "subCategoryName" },
      { path: "collectionIds", select: "collectionName" },
      { path: "subCollectionIds", select: "subCollectionName" },
      { path: "colorId", select: "colorName hexCode" },
      { path: "skillLevelIds", select: "skillLevelName" },
      { path: "createdBy", select: "firstName lastName username" },
      { path: "updatedBy", select: "firstName lastName username" },
      { path: "variants.colorId", select: "colorName hexCode" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        id: product._id,
        productName: product.productName,
        price: product.price,
        discount: product.discount,
        discountPrice: product.discountPrice,
        description1: product.description1,
        description2: product.description2,
        description3: product.description3,
        productType: product.productType,
        ...(product.productType === "standalone" && {
          partId: product.partId,
          itemId: product.itemId,
          images: product.images,
          colorId: product.colorId,
          stock: product.stock,
        }),
        ...(product.productType === "variant" &&
          product.variants &&
          product.variants.length > 0 && {
            variants: product.variants,
          }),
        categoryIds: product.categoryIds,
        subCategoryIds: product.subCategoryIds,
        collectionIds: product.collectionIds,
        subCollectionIds: product.subCollectionIds,
        pieceCount: product.pieceCount,
        length: product.length,
        width: product.width,
        height: product.height,
        skillLevelIds: product.skillLevelIds,
        isActive: product.isActive,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Delete Product ------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        description: "Please provide a valid product ID.",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        description: "The requested product does not exist.",
      });
    }

    // Delete standalone product images
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        try {
          await deleteImage(img.publicId);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
    }

    // Delete variant images
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.image && variant.image.publicId) {
          try {
            await deleteImage(variant.image.publicId);
          } catch (error) {
            console.error("Error deleting variant image:", error);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Public Product Controllers ------------------------------------------

// Get all public products (minimal fields for listing)
export const getPublicProducts = async (req, res) => {
  try {
    // Validate and normalize pagination parameters
    const validatedLimit = validatePublicProductLimit(req.query.limit);
    const { page, search } = normalizePagination({
      page: req.query.page,
      limit: validatedLimit,
      search: req.query.search,
    });
    const limit = validatedLimit;

    // Validate price parameters
    const priceValidation = validatePriceParams(
      req.query.priceMin,
      req.query.priceMax,
    );
    if (!priceValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid price range",
        description: priceValidation.error,
      });
    }

    // Validate and filter IDs
    const validatedCategoryIds = validateAndFilterIds(
      req.query.categoryIds?.split(",").filter(Boolean),
    );
    const validatedSubCategoryIds = validateAndFilterIds(
      req.query.subCategoryIds?.split(",").filter(Boolean),
    );
    const validatedCollectionIds = validateAndFilterIds(
      req.query.collectionIds?.split(",").filter(Boolean),
    );
    const validatedSubCollectionIds = validateAndFilterIds(
      req.query.subCollectionIds?.split(",").filter(Boolean),
    );
    const validatedColorIds = validateAndFilterIds(
      req.query.colorIds?.split(",").filter(Boolean),
    );
    const validatedSkillLevelIds = validateAndFilterIds(
      req.query.skillLevelIds?.split(",").filter(Boolean),
    );

    // Build query using utility function
    const query = await buildPublicProductQuery({
      search,
      priceMin: priceValidation.priceMin,
      priceMax: priceValidation.priceMax,
      categoryIds:
        validatedCategoryIds.length > 0
          ? validatedCategoryIds.join(",")
          : undefined,
      subCategoryIds:
        validatedSubCategoryIds.length > 0
          ? validatedSubCategoryIds.join(",")
          : undefined,
      collectionIds:
        validatedCollectionIds.length > 0
          ? validatedCollectionIds.join(",")
          : undefined,
      subCollectionIds:
        validatedSubCollectionIds.length > 0
          ? validatedSubCollectionIds.join(",")
          : undefined,
      colorIds:
        validatedColorIds.length > 0 ? validatedColorIds.join(",") : undefined,
      skillLevelIds:
        validatedSkillLevelIds.length > 0
          ? validatedSkillLevelIds.join(",")
          : undefined,
    });

    // Validate and get sort parameter
    const sortBy = validateSortBy(req.query.sortBy);
    const sort = buildSortObject(sortBy);

    // Apply pagination with minimal field selection
    const skip = (page - 1) * limit;
    const selectFields =
      "_id productName price discount discountPrice productType createdAt images variants";

    // Build query with minimal fields
    let mongooseQuery = Product.find(query)
      .select(selectFields)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Populate only essential fields
    mongooseQuery = mongooseQuery
      .populate("categoryIds", "categoryName")
      .populate("subCategoryIds", "subCategoryName")
      .populate("collectionIds", "collectionName")
      .populate("subCollectionIds", "subCollectionName")
      .populate("colorId", "colorName hexCode")
      .populate("skillLevelIds", "skillLevelName")
      .populate("variants.colorId", "colorName hexCode");

    // Execute queries in parallel
    const [totalItems, products] = await Promise.all([
      Product.countDocuments(query),
      mongooseQuery.exec(),
    ]);

    // Process products using utility function
    const processedProducts = processProductsForListing(products);
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      products: processedProducts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get public products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

// Get single public product (full details for detail page)
export const getPublicProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        description: "Please provide a valid product ID.",
      });
    }

    const product = await Product.findOne({ _id: id, isActive: true })
      .select("-__v -createdBy -updatedBy")
      .populate("categoryIds", "categoryName")
      .populate("subCategoryIds", "subCategoryName")
      .populate("collectionIds", "collectionName")
      .populate("subCollectionIds", "subCollectionName")
      .populate("colorId", "colorName hexCode")
      .populate("skillLevelIds", "skillLevelName")
      .populate("variants.colorId", "colorName hexCode")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        description:
          "The requested product does not exist or is not available.",
      });
    }

    const processedProduct = processProductForDetails(product);

    return res.status(200).json({
      success: true,
      product: processedProduct,
    });
  } catch (error) {
    console.error("Get public product by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

// Get public categories with nested subcategories and product counts
export const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .select("_id categoryName")
      .sort({ categoryName: 1 })
      .lean();

    const subCategories = await SubCategory.find()
      .select("_id subCategoryName categoryId")
      .sort({ subCategoryName: 1 })
      .lean();

    // Get counts using utility function
    const { categoryCountMap, subCategoryCountMap } = await getCategoryCounts();

    // Nest subcategories under their parent categories
    const categoriesWithSubs = categories.map((category) => {
      const subCats = subCategories
        .filter((sub) => sub.categoryId.toString() === category._id.toString())
        .map(({ _id, subCategoryName }) => ({
          _id,
          subCategoryName,
          count: subCategoryCountMap.get(_id.toString()) || 0,
        }));

      return {
        _id: category._id,
        categoryName: category.categoryName,
        count: categoryCountMap.get(category._id.toString()) || 0,
        subCategories: subCats,
      };
    });

    return res.status(200).json({
      success: true,
      categories: categoriesWithSubs,
    });
  } catch (error) {
    console.error("Get public categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

// Get public collections with nested subcollections and product counts
export const getPublicCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .select("_id collectionName")
      .sort({ collectionName: 1 })
      .lean();

    const subCollections = await SubCollection.find()
      .select("_id subCollectionName collectionId")
      .sort({ subCollectionName: 1 })
      .lean();

    // Get counts using utility function
    const { collectionCountMap, subCollectionCountMap } =
      await getCollectionCounts();

    // Nest subcollections under their parent collections
    const collectionsWithSubs = collections.map((collection) => {
      const subCols = subCollections
        .filter(
          (sub) => sub.collectionId.toString() === collection._id.toString(),
        )
        .map(({ _id, subCollectionName }) => ({
          _id,
          subCollectionName,
          count: subCollectionCountMap.get(_id.toString()) || 0,
        }));

      return {
        _id: collection._id,
        collectionName: collection.collectionName,
        count: collectionCountMap.get(collection._id.toString()) || 0,
        subCollections: subCols,
      };
    });

    return res.status(200).json({
      success: true,
      collections: collectionsWithSubs,
    });
  } catch (error) {
    console.error("Get public collections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch collections",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

// Get public colors with product counts
export const getPublicColors = async (req, res) => {
  try {
    const colors = await Color.find()
      .select("_id colorName hexCode")
      .sort({ colorName: 1 })
      .lean();

    // Get counts using utility function
    const colorCountMap = await getColorCounts();

    // Add counts to colors
    const colorsWithCounts = colors.map((color) => ({
      ...color,
      count: colorCountMap.get(color._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      colors: colorsWithCounts,
    });
  } catch (error) {
    console.error("Get public colors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch colors",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

// Get public skill levels with product counts
export const getPublicSkillLevels = async (req, res) => {
  try {
    const skillLevels = await SkillLevel.find()
      .select("_id skillLevelName")
      .sort({ skillLevelName: 1 })
      .lean();

    // Get counts using utility function
    const skillLevelCountMap = await getSkillLevelCounts();

    // Add counts to skill levels
    const skillLevelsWithCounts = skillLevels.map((skillLevel) => ({
      ...skillLevel,
      count: skillLevelCountMap.get(skillLevel._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      skillLevels: skillLevelsWithCounts,
    });
  } catch (error) {
    console.error("Get public skill levels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skill levels",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
