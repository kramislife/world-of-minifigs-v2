/** Effective unit price: discountPrice if valid, else price */
export const getEffectiveUnitPrice = (source) => {
  if (!source) return 0;
  const price = Number(source.price) || 0;
  const discountPrice =
    source.discountPrice != null && source.discountPrice >= 0
      ? Number(source.discountPrice)
      : null;
  return discountPrice ?? price;
};

/** Full price display info for product/variant source */
export const getPriceDisplayInfo = (source, quantity = 1) => {
  const price = Number(source?.price) || 0;
  const discountPrice =
    source?.discountPrice != null && source.discountPrice >= 0
      ? Number(source.discountPrice)
      : null;
  const effectivePrice = discountPrice ?? price;
  const hasDiscount =
    discountPrice != null && discountPrice < price && price > 0;
  return {
    price,
    discountPrice,
    effectivePrice,
    hasDiscount,
    displayPrice: effectivePrice.toFixed(2),
    originalPrice: price.toFixed(2),
    totalPrice: (effectivePrice * quantity).toFixed(2),
  };
};

/** Price and discount for order items (effective unit price + discount %) */
export const getPriceAndDiscount = (source) => {
  const price =
    source?.discountPrice != null && source.discountPrice >= 0
      ? Number(source.discountPrice)
      : Number(source?.price) || 0;
  const discount =
    source?.discount != null && source.discount >= 0
      ? Number(source.discount)
      : 0;
  return { price, discount };
};

/** Compute discountPrice from price and discount % (for persistence) */
export const calculateDiscountPrice = (price, discount) => {
  if (!discount || discount <= 0) return null;
  return Math.round(price * (1 - discount / 100) * 100) / 100;
};
