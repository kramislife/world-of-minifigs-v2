const POPULATE_COLORS = [
  { path: "variants.colorId", select: "colorName hexCode" },
  { path: "variants.secondaryColorId", select: "colorName hexCode" },
  { path: "colorId", select: "colorName hexCode" },
  { path: "secondaryColorId", select: "colorName hexCode" },
];

export const POPULATE_COLORS_NAMES_ONLY = [
  { path: "variants.colorId", select: "colorName" },
  { path: "variants.secondaryColorId", select: "colorName" },
  { path: "colorId", select: "colorName" },
  { path: "secondaryColorId", select: "colorName" },
];

/** For getCart - includes isActive, stock, hexCode for swatches */
export const CART_POPULATE = {
  path: "items.productId",
  select:
    "productName price discountPrice productType variants images isActive stock colorId secondaryColorId",
  populate: POPULATE_COLORS,
};

/** For payment order creation - includes discount */
export const CART_POPULATE_ORDER = {
  path: "items.productId",
  select:
    "productName price discount discountPrice productType variants images colorId secondaryColorId",
  populate: POPULATE_COLORS_NAMES_ONLY,
};

/** For Stripe checkout session - includes isActive */
export const CART_POPULATE_CHECKOUT = {
  path: "items.productId",
  select:
    "productName price discountPrice productType variants images isActive colorId secondaryColorId",
  populate: POPULATE_COLORS_NAMES_ONLY,
};
