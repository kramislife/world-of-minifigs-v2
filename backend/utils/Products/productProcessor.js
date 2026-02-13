import { getPriceDisplayInfo } from "./productPriceUtils.js";

export const processProductForListing = (product, filterColorIds = []) => {
  const priceInfo = getPriceDisplayInfo(product, 1);
  const minimalProduct = {
    _id: product._id,
    productName: product.productName,
    price: product.price,
    discount: product.discount,
    discountPrice: product.discountPrice,
    displayPrice: priceInfo.displayPrice,
    hasDiscount: priceInfo.hasDiscount,
    productType: product.productType,
    createdAt: product.createdAt,
    categoryIds: product.categoryIds || [],
    subCategoryIds: product.subCategoryIds || [],
    collectionIds: product.collectionIds || [],
    subCollectionIds: product.subCollectionIds || [],
    skillLevelIds: product.skillLevelIds || [],
  };

  // Handle images and stock based on product type
  if (product.productType === "standalone") {
    minimalProduct.images = product.images || [];
    minimalProduct.colorId = product.colorId;
    minimalProduct.secondaryColorId = product.secondaryColorId || null;
    minimalProduct.stock = product.stock !== undefined ? product.stock : 0;
    // Computed first image URL for display
    minimalProduct.imageUrl = product.images?.[0]?.url || null;
  } else if (
    product.productType === "variant" &&
    product.variants?.length > 0
  ) {
    // Include variant images and stock
    minimalProduct.variants = product.variants.map((variant) => ({
      image: variant.image || null,
      colorId: variant.colorId || null,
      secondaryColorId: variant.secondaryColorId || null,
      stock: variant.stock !== undefined ? variant.stock : 0,
    }));

    // Find the variant that matches the filtered color (if any)
    let matchingVariantIndex = 0; // Default to first variant

    if (filterColorIds.length > 0) {
      // Convert filterColorIds to strings for comparison
      const filterColorStrings = filterColorIds.map((id) => String(id));

      // Find the first variant that matches any of the filtered colors
      const matchIndex = product.variants.findIndex((variant) => {
        const primaryColorId = String(
          variant.colorId?._id || variant.colorId || "",
        );
        const secondaryColorId = String(
          variant.secondaryColorId?._id || variant.secondaryColorId || "",
        );

        return (
          filterColorStrings.includes(primaryColorId) ||
          (secondaryColorId && filterColorStrings.includes(secondaryColorId))
        );
      });

      if (matchIndex !== -1) {
        matchingVariantIndex = matchIndex;
      }
    }

    // Use the matching variant's image URL for display
    minimalProduct.imageUrl =
      product.variants[matchingVariantIndex]?.image?.url || null;
    minimalProduct.displayVariantIndex = matchingVariantIndex;
    // For variant products, total stock is the sum of all variants
    minimalProduct.stock = product.variants.reduce(
      (sum, v) => sum + (v.stock || 0),
      0,
    );
  } else {
    minimalProduct.imageUrl = null;
    minimalProduct.stock = 0;
  }

  return minimalProduct;
};

export const processProductsForListing = (products, filterColorIds = []) => {
  return products.map((product) =>
    processProductForListing(product, filterColorIds),
  );
};

//--------------------------------------------- Type Filter -------------------------------------------------

export const filterProductByType = (product) => {
  if (product.productType === "standalone") {
    const { variants, ...productWithoutVariants } = product;
    return productWithoutVariants;
  } else if (product.productType === "variant") {
    const {
      itemId,
      images,
      colorId,
      secondaryColorId,
      stock,
      ...productWithoutStandalone
    } = product;
    return productWithoutStandalone;
  }
  return product;
};

//------------------------------------------------ Details -------------------------------------------------

export const processProductForDetails = (product) => {
  if (!product) return null;

  const priceInfo = getPriceDisplayInfo(product, 1);
  const processedProduct = {
    ...product,
    displayPrice: priceInfo.displayPrice,
    hasDiscount: priceInfo.hasDiscount,
  };

  // Process images based on product type
  if (product.productType === "standalone" && product.images?.length > 0) {
    processedProduct.allImages = product.images.map((img, index) => ({
      url: img.url,
      type: "standalone",
      index,
    }));
  } else if (
    product.productType === "variant" &&
    product.variants?.length > 0
  ) {
    processedProduct.allImages = product.variants
      .map((variant, index) => ({
        url: variant.image?.url,
        type: "variant",
        index,
        colorId: variant.colorId?._id || variant.colorId,
        colorName: variant.colorId?.colorName,
        hexCode: variant.colorId?.hexCode,
        secondaryColorId:
          variant.secondaryColorId?._id || variant.secondaryColorId,
        secondaryColorName: variant.secondaryColorId?.colorName,
        secondaryHexCode: variant.secondaryColorId?.hexCode,
      }))
      .filter((img) => img.url);
  } else {
    processedProduct.allImages = [];
  }

  // Process features & classifications (prioritize sub-items over parent items)
  const categories =
    product.subCategoryIds?.length > 0
      ? product.subCategoryIds.map((sub) => ({
          name: sub.subCategoryName || sub,
          type: "subCategory",
        }))
      : product.categoryIds?.map((cat) => ({
          name: cat.categoryName || cat,
          type: "category",
        })) || [];

  const collections =
    product.subCollectionIds?.length > 0
      ? product.subCollectionIds.map((sub) => ({
          name: sub.subCollectionName || sub,
          type: "subCollection",
        }))
      : product.collectionIds?.map((col) => ({
          name: col.collectionName || col,
          type: "collection",
        })) || [];

  processedProduct.features = {
    categories,
    collections,
  };

  // Process color variants for variant products or single color for standalone
  if (product.productType === "variant" && product.variants?.length > 0) {
    processedProduct.colorVariants = product.variants
      .map((variant, index) => ({
        colorId: variant.colorId?._id || variant.colorId,
        colorName: variant.colorId?.colorName,
        hexCode: variant.colorId?.hexCode,
        secondaryColorId:
          variant.secondaryColorId?._id || variant.secondaryColorId,
        secondaryColorName: variant.secondaryColorId?.colorName,
        secondaryHexCode: variant.secondaryColorId?.hexCode,
        index,
      }))
      .filter((v) => v.colorId);
  } else if (product.productType === "standalone" && product.colorId) {
    // For standalone products, create a single color entry if colorId exists
    processedProduct.colorVariants = [
      {
        colorId: product.colorId?._id || product.colorId,
        colorName: product.colorId?.colorName,
        hexCode: product.colorId?.hexCode,
        secondaryColorId:
          product.secondaryColorId?._id || product.secondaryColorId,
        secondaryColorName: product.secondaryColorId?.colorName,
        secondaryHexCode: product.secondaryColorId?.hexCode,
        index: 0,
      },
    ].filter((v) => v.colorId && v.colorName);
  } else {
    processedProduct.colorVariants = [];
  }

  return processedProduct;
};
