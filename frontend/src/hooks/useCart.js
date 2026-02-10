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

// "Add to Cart" button logic and state

export const useAddToCart = ({
  product,
  variantIndex = null,
  quantity = 1,
}) => {
  const { handleAddToCart, getAddToCartStatus } = useCart();

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
      handleAddToCart(product, quantity, variantIndex);
    },
    [product, quantity, variantIndex, handleAddToCart],
  );

  return {
    isSoldOut,
    label,
    onClick,
  };
};

// Hook for managing variant selection in the cart/product views
export const useVariantSelection = ({ product, onAddToCart, switchToCart }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(() => {
    if (!product?.variants || product.variants.length === 0) return 0;
    const firstInStock = product.variants.findIndex((v) => v.stock > 0);
    return firstInStock !== -1 ? firstInStock : 0;
  });

  const selectedVariant = product?.variants?.[selectedVariantIndex];

  const carouselImages = useMemo(() => {
    return product?.variants?.map((v) => v.image?.url).filter(Boolean) || [];
  }, [product]);

  const { setApi, scrollTo } = useCarousel({
    itemCount: carouselImages.length,
  });

  // Smooth scroll to selected variant image
  useEffect(() => {
    if (scrollTo) {
      scrollTo(selectedVariantIndex);
    }
  }, [selectedVariantIndex, scrollTo]);

  const handleAdd = useCallback(() => {
    if (selectedVariant && selectedVariant.stock > 0) {
      onAddToCart(product, 1, selectedVariantIndex);
      if (switchToCart) switchToCart();
    }
  }, [
    product,
    selectedVariantIndex,
    selectedVariant,
    onAddToCart,
    switchToCart,
  ]);

  // Normalized color data for swatches
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
    product.price ||
    0
  ).toFixed(2);
  const originalPrice = (selectedVariant?.price || product.price || 0).toFixed(
    2,
  );
  const hasDiscount = Boolean(
    selectedVariant?.discountPrice || product.discountPrice,
  );

  return {
    selectedVariantIndex,
    setSelectedVariantIndex,
    selectedVariant,
    carouselImages,
    normalizedColorVariants,
    selectedColorName,
    displayPrice,
    originalPrice,
    hasDiscount,
    setApi,
    scrollTo,
    handleAdd,
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
  } = useGetCartQuery(undefined, { skip: !isAuthenticated });

  const [addToCartServer, { isLoading: isAddingToCart }] =
    useAddToCartMutation();
  const [updateCartItemServer, { isLoading: isUpdatingQuantity }] =
    useUpdateCartItemMutation();
  const [removeCartItemServer, { isLoading: isRemovingItem }] =
    useRemoveCartItemMutation();
  const [clearCartServer] = useClearCartMutation();
  const [syncCartServer] = useSyncCartMutation();

  // Sync server data to local state for authenticated users
  // Also persist to localStorage so cart survives logout (unified cart experience)
  useEffect(() => {
    if (isAuthenticated && serverCartData?.cart?.items) {
      const items = serverCartData.cart.items;
      dispatch(setCartItems(items));
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [isAuthenticated, serverCartData, dispatch]);

  // Computed Values
  const items = useMemo(() => {
    const rawItems = isAuthenticated
      ? serverCartData?.cart?.items || []
      : localItems;

    return rawItems.map((item) => {
      const price = item.discountPrice || item.price || 0;
      return {
        ...item,
        displayPrice: price.toFixed(2),
        totalItemPrice: (price * item.quantity).toFixed(2),
      };
    });
  }, [isAuthenticated, serverCartData, localItems]);

  const cartTotals = useMemo(
    () => ({
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice:
        items.reduce(
          (sum, i) => sum + (i.discountPrice || i.price || 0) * i.quantity,
          0,
        ) || 0,
    }),
    [items],
  );

  // Helper: Get button status based on stock
  const getAddToCartStatus = useCallback((product, variantIndex = null) => {
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
  }, []);

  // Handlers
  const addToCart = useCallback(
    async (product, quantity = 1, variantIndex = null) => {
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
        } catch (err) {
          toast.error(err.data?.message || "Cart error", {
            description:
              err.data?.description ||
              `${displayName} has reached its maximum stock.`,
          });
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
      dispatch(openCart());
    },
    [isAuthenticated, addToCartServer, dispatch, items],
  );

  const handleAddToCart = useCallback(
    (product, quantity = 1, variantIndex = null) => {
      const { isSoldOut } = getAddToCartStatus(product, variantIndex);
      if (isSoldOut) return;

      if (product.productType === "standalone" || variantIndex !== null) {
        addToCart(product, quantity, variantIndex);
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
          toast.error(err.data?.message || "Update failed", {
            description:
              err.data?.description ||
              "Unable to update quantity. Please try again.",
          });
        }
      } else {
        dispatch(updateQuantityLocal({ productId, variantIndex, quantity }));
      }
    },
    [isAuthenticated, updateCartItemServer, dispatch],
  );

  const removeItem = useCallback(
    async (productId, variantIndex) => {
      if (isAuthenticated) {
        try {
          await removeCartItemServer({ productId, variantIndex }).unwrap();
        } catch (err) {
          toast.error(err.data?.message || "Remove failed", {
            description:
              err.data?.description ||
              "Unable to remove item from cart. Please try again.",
          });
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
        toast.error(err.data?.message || "Clear failed", {
          description:
            err.data?.description ||
            "Unable to empty your cart. Please try again.",
        });
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
        toast.error(err.data?.message || "Sync failed", {
          description:
            err.data?.description ||
            "Unable to sync your guest cart to your account.",
        });
      }
    }
  }, [isAuthenticated, localItems, syncCartServer, dispatch]);

  return {
    items,
    ...cartTotals,
    isCartLoading,
    isCartFetching,
    isUpdating:
      isAddingToCart ||
      isUpdatingQuantity ||
      isRemovingItem ||
      (items.length === 0 && isCartFetching),

    // UI State
    isOpen,
    sheetMode,
    selectedProduct,

    // Status Helpers
    getAddToCartStatus,

    // Operations
    addToCart,
    handleAddToCart,
    updateQuantity,
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
