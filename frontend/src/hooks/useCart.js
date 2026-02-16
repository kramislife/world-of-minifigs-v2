import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useCarousel } from "./useCarousel";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSyncCartMutation,
} from "@/redux/api/authApi";
import { useCreateCheckoutSessionMutation } from "@/redux/api/paymentApi";
import {
  setCartItems,
  addToCartLocal,
  updateQuantityLocal,
  removeFromCartLocal,
  clearCartLocal,
  openCart,
  openVariantSelection,
  closeSheet,
  setSheetMode,
} from "@/redux/slices/cartSlice";
import { handleApiError } from "@/utils/apiHelpers";

//------------------------------------------- Helpers -------------------------------------------

const getAddToCartStatus = (product, variantIndex = null) => {
  if (!product) return { isSoldOut: false, label: "Add to Cart" };

  const isStandalone = product.productType === "standalone";
  const isSoldOut = isStandalone
    ? product.stock <= 0
    : variantIndex !== null
      ? product.variants?.[variantIndex]?.stock <= 0
      : product.variants?.every((v) => v.stock <= 0);

  const label = isSoldOut
    ? "Out of Stock"
    : isStandalone || variantIndex !== null
      ? "Add to Cart"
      : "Choose Options";

  return { isSoldOut, label };
};

// "Add to Cart" button logic and state

export const useAddToCart = ({
  product,
  variantIndex = null,
  quantity = 1,
  onSuccess,
}) => {
  const { handleAddToCart, getAddToCartStatus, isAddingToCart } = useCart();

  const { isSoldOut, label } = useMemo(
    () => getAddToCartStatus(product, variantIndex),
    [product, variantIndex, getAddToCartStatus],
  );

  const onClick = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      handleAddToCart(product, quantity, variantIndex, onSuccess);
    },
    [product, quantity, variantIndex, onSuccess, handleAddToCart],
  );

  return {
    isSoldOut,
    label,
    onClick,
    isLoading: isAddingToCart,
  };
};

// Product details page: direct Stripe checkout (no cart)
export const useProductCheckout = ({
  product,
  variantIndex = null,
  quantity = 1,
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [createCheckoutSession, { isLoading: isCheckoutLoading }] =
    useCreateCheckoutSessionMutation();

  const { isSoldOut, label } = useMemo(
    () => getAddToCartStatus(product, variantIndex),
    [product, variantIndex],
  );

  const isDisabled =
    !product ||
    !isAuthenticated ||
    isSoldOut ||
    (product.productType === "variant" && variantIndex === null);

  const handleProductCheckout = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to checkout", {
        description: "You need to be signed in to complete your purchase.",
      });
      return;
    }
    if (isDisabled) return;

    try {
      const res = await createCheckoutSession({
        productId: product._id,
        variantIndex: product.productType === "variant" ? variantIndex : null,
        quantity,
      }).unwrap();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        handleApiError(
          null,
          "Checkout failed",
          "Could not start checkout. Please try again.",
        );
      }
    } catch (err) {
      handleApiError(err, "Checkout failed", "Please try again.");
    }
  }, [
    isAuthenticated,
    isDisabled,
    product,
    variantIndex,
    quantity,
    createCheckoutSession,
  ]);

  const buttonLabel =
    isDisabled && !isAuthenticated
      ? "Sign in to Checkout"
      : isDisabled
        ? label
        : "Checkout";

  return {
    handleProductCheckout,
    isCheckoutLoading,
    isDisabled,
    label: buttonLabel,
  };
};

// Hook for variant selection UI (color swatches, images, price display)
export const useVariantSelection = ({ product }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(() => {
    if (!product?.variants || product.variants.length === 0) return 0;
    const firstInStock = product.variants.findIndex((v) => v.stock > 0);
    return firstInStock !== -1 ? firstInStock : 0;
  });

  const selectedVariant = product?.variants?.[selectedVariantIndex];

  const carouselImages = useMemo(
    () => product?.variants?.map((v) => v.image?.url).filter(Boolean) || [],
    [product],
  );

  const { setApi, scrollTo } = useCarousel({
    itemCount: carouselImages.length,
  });

  useEffect(() => {
    if (scrollTo) scrollTo(selectedVariantIndex);
  }, [selectedVariantIndex, scrollTo]);

  const normalizedColorVariants = useMemo(() => {
    const source = product?.colorVariants || product?.variants || [];
    const isFlattened = Boolean(product?.colorVariants);

    return source.map((v, i) => {
      if (isFlattened) return { ...v, index: i };
      return {
        index: i,
        colorName: v.colorId?.colorName,
        hexCode: v.colorId?.hexCode,
        secondaryColorName: v.secondaryColorId?.colorName,
        secondaryHexCode: v.secondaryColorId?.hexCode,
        stock: v.stock,
      };
    });
  }, [product]);

  const selectedColorName = useMemo(() => {
    const current = normalizedColorVariants[selectedVariantIndex];
    if (!current) return "Select a color";
    return current.secondaryColorName
      ? `${current.colorName} / ${current.secondaryColorName}`
      : current.colorName;
  }, [normalizedColorVariants, selectedVariantIndex]);

  const displayPrice = (
    selectedVariant?.discountPrice ||
    selectedVariant?.price ||
    product?.price ||
    0
  ).toFixed(2);
  const originalPrice = (selectedVariant?.price || product?.price || 0).toFixed(
    2,
  );
  const hasDiscount = Boolean(
    selectedVariant?.discountPrice || product?.discountPrice,
  );

  return {
    selectedVariantIndex,
    setSelectedVariantIndex,
    carouselImages,
    normalizedColorVariants,
    selectedColorName,
    displayPrice,
    originalPrice,
    hasDiscount,
    setApi,
  };
};

// Core hook for cart state and operations
export const useCart = () => {
  const dispatch = useDispatch();

  // Redux State
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    items: localItems,
    isOpen,
    sheetMode,
    selectedProduct,
  } = useSelector((state) => state.cart);

  // API Queries & Mutations
  const {
    data: serverCartData,
    isLoading: isCartLoading,
    isFetching: isCartFetching,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      refetchCart();
    }
  }, [isAuthenticated, isOpen, refetchCart]);

  const [addToCartServer, { isLoading: isAddingToCart }] =
    useAddToCartMutation();
  const [updateCartItemServer, { isLoading: isUpdatingQuantity }] =
    useUpdateCartItemMutation();
  const [removeCartItemServer, { isLoading: isRemovingItem }] =
    useRemoveCartItemMutation();
  const [clearCartServer] = useClearCartMutation();
  const [syncCartServer] = useSyncCartMutation();
  const [createCheckoutSession, { isLoading: isCheckoutLoading }] =
    useCreateCheckoutSessionMutation();

  // Sync server data to local state for authenticated users
  // Also persist to localStorage so cart survives logout (unified cart experience)
  useEffect(() => {
    if (isAuthenticated && Array.isArray(serverCartData?.cart?.items)) {
      const items = serverCartData.cart.items;
      dispatch(setCartItems(items));
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [isAuthenticated, serverCartData, dispatch]);

  const getColorDisplay = useCallback((item) => {
    const label =
      item.colorLabel ??
      [item.variantColor, item.secondaryColor].filter(Boolean).join(" / ");
    return label || null;
  }, []);

  const formatCartItem = useCallback(
    (item) => {
      if (
        item.displayPrice != null &&
        item.totalItemPrice != null &&
        item.hasDiscount !== undefined
      ) {
        return { ...item, colorDisplay: getColorDisplay(item) };
      }
      const price = Number(item.price) || 0;
      const discountPrice =
        item.discountPrice != null && item.discountPrice >= 0
          ? Number(item.discountPrice)
          : null;
      const effectivePrice = discountPrice ?? price;
      const hasDiscount =
        discountPrice != null && discountPrice < price && price > 0;
      const colorLabel =
        item.colorLabel ??
        ([item.variantColor, item.secondaryColor].filter(Boolean).join(" / ") ||
          null);

      return {
        ...item,
        displayPrice: effectivePrice.toFixed(2),
        originalPrice: price.toFixed(2),
        hasDiscount,
        totalItemPrice: (effectivePrice * item.quantity).toFixed(2),
        colorLabel,
        colorDisplay: getColorDisplay({ ...item, colorLabel }),
      };
    },
    [getColorDisplay],
  );

  const items = useMemo(() => {
    const rawItems = isAuthenticated
      ? (Array.isArray(serverCartData?.cart?.items)
          ? serverCartData.cart.items
          : [])
      : localItems;
    return Array.isArray(rawItems) ? rawItems.map(formatCartItem) : [];
  }, [isAuthenticated, serverCartData, localItems, formatCartItem]);

  const cartTotals = useMemo(() => {
    const computedTotal = items.reduce(
      (sum, i) => sum + parseFloat(i.totalItemPrice || 0),
      0,
    );
    const serverSubtotal = serverCartData?.cart?.subtotal;
    const serverSubtotalFormatted = serverCartData?.cart?.subtotalFormatted;
    return {
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: serverSubtotal != null ? serverSubtotal : computedTotal,
      totalPriceFormatted:
        serverSubtotalFormatted != null
          ? serverSubtotalFormatted
          : (computedTotal || 0).toFixed(2),
    };
  }, [items, serverCartData]);

  // Handlers
  const addToCart = useCallback(
    async (product, quantity = 1, variantIndex = null, onSuccess) => {
      // Check if item already in cart to verify total stock limit
      const existingItem = items.find(
        (item) =>
          item.productId === product._id &&
          (item.variantIndex ?? null) === (variantIndex ?? null),
      );

      const isVariant =
        product.productType === "variant" && variantIndex !== null;
      const variant = isVariant ? product.variants?.[variantIndex] : null;

      const variantColor = isVariant
        ? variant?.colorId?.colorName ||
          product.colorVariants?.[variantIndex]?.colorName
        : product.colorId?.colorName || product.colorVariants?.[0]?.colorName;

      const secondaryColor = isVariant
        ? variant?.secondaryColorId?.colorName
        : product.secondaryColorId?.colorName;

      const variantName = isVariant
        ? [variantColor, variant?.secondaryColorId?.colorName]
            .filter(Boolean)
            .join(" / ")
        : null;

      const displayName = variantName
        ? `${product.productName} - ${variantName}`
        : product.productName;

      const availableStock = isVariant ? variant?.stock : product.stock;

      const currentQuantityInCart = existingItem?.quantity || 0;
      const totalRequestedQuantity = currentQuantityInCart + quantity;

      if (isAuthenticated) {
        try {
          await addToCartServer({
            productId: product._id,
            quantity,
            variantIndex,
          }).unwrap();
          await refetchCart();
        } catch (err) {
          handleApiError(
            err,
            "Cart error",
            `${displayName} has reached its maximum stock.`,
          );
          return;
        }
      } else {
        // Guest mode validation (Frontend as primary source of validation)
        if (totalRequestedQuantity > availableStock) {
          toast.error(`${displayName} has reached its maximum stock.`);
          dispatch(openCart());
          return;
        }

        dispatch(
          addToCartLocal({
            product,
            variantIndex,
            quantity,
          }),
        );
      }
      onSuccess?.();
      dispatch(openCart());
    },
    [isAuthenticated, addToCartServer, refetchCart, dispatch, items],
  );

  const handleAddToCart = useCallback(
    (product, quantity = 1, variantIndex = null, onSuccess) => {
      const { isSoldOut } = getAddToCartStatus(product, variantIndex);
      if (isSoldOut) return;

      if (product.productType === "standalone" || variantIndex !== null) {
        addToCart(product, quantity, variantIndex, onSuccess);
      } else {
        dispatch(openVariantSelection(product));
      }
    },
    [getAddToCartStatus, addToCart, dispatch],
  );

  const updateQuantity = useCallback(
    async (quantity, productId, variantIndex) => {
      if (isAuthenticated) {
        try {
          await updateCartItemServer({
            productId,
            variantIndex,
            quantity,
          }).unwrap();
        } catch (err) {
          handleApiError(
            err,
            "Update failed",
            "Unable to update quantity. Please try again.",
          );
        }
      } else {
        dispatch(updateQuantityLocal({ productId, variantIndex, quantity }));
      }
    },
    [isAuthenticated, updateCartItemServer, dispatch],
  );

  // Cart item quantity handlers (used by CartItem via CartSheet -> CartView)
  const handleQuantityDecrement = useCallback(
    (productId, variantIndex) => {
      const item = items.find(
        (i) =>
          i.productId === productId &&
          (i.variantIndex ?? null) === (variantIndex ?? null),
      );
      if (!item || item.quantity <= 1) return;
      updateQuantity(item.quantity - 1, productId, variantIndex);
    },
    [items, updateQuantity],
  );

  const handleQuantityIncrement = useCallback(
    (productId, variantIndex) => {
      const item = items.find(
        (i) =>
          i.productId === productId &&
          (i.variantIndex ?? null) === (variantIndex ?? null),
      );
      if (!item) return;
      const max = item.stock ?? Infinity;
      if (item.quantity >= max) return;
      updateQuantity(item.quantity + 1, productId, variantIndex);
    },
    [items, updateQuantity],
  );

  const removeItem = useCallback(
    async (productId, variantIndex) => {
      if (isAuthenticated) {
        try {
          await removeCartItemServer({ productId, variantIndex }).unwrap();
        } catch (err) {
          handleApiError(
            err,
            "Remove failed",
            "Unable to remove item from cart. Please try again.",
          );
        }
      } else {
        dispatch(removeFromCartLocal({ productId, variantIndex }));
      }
    },
    [isAuthenticated, removeCartItemServer, dispatch],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearCartServer().unwrap();
      } catch (err) {
        handleApiError(
          err,
          "Clear failed",
          "Unable to empty your cart. Please try again.",
        );
      }
    } else {
      dispatch(clearCartLocal());
    }
  }, [isAuthenticated, clearCartServer, dispatch]);

  const syncCart = useCallback(async () => {
    if (isAuthenticated && localItems.length > 0) {
      try {
        const syncItems = localItems.map((item) => ({
          productId: item.productId,
          productType: item.productType,
          variantIndex: item.variantIndex,
          quantity: item.quantity,
        }));
        await syncCartServer(syncItems).unwrap();
        dispatch(clearCartLocal());
      } catch (err) {
        handleApiError(
          err,
          "Sync failed",
          "Unable to sync your guest cart to your account.",
        );
      }
    }
  }, [isAuthenticated, localItems, syncCartServer, dispatch]);

  const handleCheckout = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to checkout", {
        description: "You need to be signed in to complete your purchase.",
      });
      dispatch(closeSheet());
      return;
    }
    try {
      const res = await createCheckoutSession().unwrap();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        handleApiError(
          null,
          "Checkout failed",
          "Could not start checkout. Please try again.",
        );
      }
    } catch (err) {
      handleApiError(err, "Checkout failed", "Please try again.");
    }
  }, [isAuthenticated, createCheckoutSession, dispatch]);

  return {
    items,
    ...cartTotals,
    isCartLoading,
    isCartFetching,
    isAddingToCart,
    isUpdating:
      isAddingToCart ||
      isUpdatingQuantity ||
      isRemovingItem ||
      (items.length === 0 && isCartFetching),
    isCheckoutLoading,

    // Operations
    handleCheckout,

    // UI State
    isOpen,
    sheetMode,
    selectedProduct,

    // Status Helpers
    getAddToCartStatus,

    addToCart,
    handleAddToCart,
    updateQuantity,
    handleQuantityDecrement,
    handleQuantityIncrement,
    removeItem,
    clearCart,
    syncCart,

    // UI Actions
    openCart: () => dispatch(openCart()),
    closeSheet: () => dispatch(closeSheet()),
    setSheetMode: (mode) => dispatch(setSheetMode(mode)),
    openVariantSelection: (p) => dispatch(openVariantSelection(p)),
  };
};
