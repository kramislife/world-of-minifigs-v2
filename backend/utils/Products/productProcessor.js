// Process product for listing (minimal fields)
export const processProductForListing = (product) => {
  const minimalProduct = {
    _id: product._id,
    productName: product.productName,
    price: product.price,
    discountPrice: product.discountPrice,
    productType: product.productType,
    createdAt: product.createdAt,
    categoryIds: product.categoryIds || [],
    subCategoryIds: product.subCategoryIds || [],
    collectionIds: product.collectionIds || [],
    subCollectionIds: product.subCollectionIds || [],
    skillLevelIds: product.skillLevelIds || [],
  };

  // Handle images - only first image for listing
  if (product.productType === "standalone" && product.images?.length > 0) {
    minimalProduct.images = [product.images[0]];
    minimalProduct.colorId = product.colorId;
  } else if (
    product.productType === "variant" &&
    product.variants?.length > 0
  ) {
    // Only include first variant's image
    minimalProduct.variants = [
      {
        image: product.variants[0].image || null,
        colorId: product.variants[0].colorId || null,
      },
    ];
  }

  return minimalProduct;
};

// Process products array for listing
export const processProductsForListing = (products) => {
  return products.map(processProductForListing);
};

// Filter product fields based on productType
export const filterProductByType = (product) => {
  if (product.productType === "standalone") {
    // Remove variant-specific fields
    const { variants, ...productWithoutVariants } = product;
    return productWithoutVariants;
  } else if (product.productType === "variant") {
    // Remove standalone-specific fields
    const {
      partId,
      itemId,
      images,
      colorId,
      stock,
      ...productWithoutStandalone
    } = product;
    return productWithoutStandalone;
  }
  return product;
};

// Remove sensitive/admin fields from product
export const removeSensitiveFields = (product) => {
  const {
    createdBy,
    updatedBy,
    cost,
    profitMargin,
    internalNotes,
    ...publicProduct
  } = product;
  return publicProduct;
};
