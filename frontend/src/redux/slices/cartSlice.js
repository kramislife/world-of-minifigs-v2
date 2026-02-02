import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: JSON.parse(localStorage.getItem("cart")) || [],
  isOpen: false,
  sheetMode: "cart", // "cart" | "variant"
  selectedProduct: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },

    addToCartLocal: (state, action) => {
      const {
        productId,
        productName,
        productType,
        variantIndex,
        variantColor,
        quantity,
        price,
        discountPrice,
        image,
        stock,
        secondaryColor,
      } = action.payload;

      const itemIndex = state.items.findIndex(
        (item) =>
          item.productId === productId &&
          (item.variantIndex ?? null) === (variantIndex ?? null),
      );

      if (itemIndex > -1) {
        state.items[itemIndex].quantity += quantity;
        state.items[itemIndex].addedAt = new Date().toISOString();
        // Update stock and price if they changed
        if (stock !== undefined) state.items[itemIndex].stock = stock;
        if (price !== undefined) state.items[itemIndex].price = price;
        if (discountPrice !== undefined)
          state.items[itemIndex].discountPrice = discountPrice;

        const item = state.items.splice(itemIndex, 1)[0];
        state.items.unshift(item);
      } else {
        const newItem = {
          productId,
          productName,
          productType,
          quantity,
          price,
          discountPrice,
          image,
          stock,
          addedAt: new Date().toISOString(),
        };

        if (productType === "variant") {
          newItem.variantIndex = variantIndex;
          newItem.variantColor = variantColor;
          newItem.secondaryColor = secondaryColor;
        }

        state.items.unshift(newItem);
      }

      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    updateQuantityLocal: (state, action) => {
      const { productId, variantIndex, quantity } = action.payload;
      const item = state.items.find(
        (i) =>
          i.productId === productId &&
          (i.variantIndex ?? null) === (variantIndex ?? null),
      );
      if (item) {
        item.quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(state.items));
      }
    },

    removeFromCartLocal: (state, action) => {
      const { productId, variantIndex } = action.payload;
      state.items = state.items.filter(
        (i) =>
          !(
            i.productId === productId &&
            (i.variantIndex ?? null) === (variantIndex ?? null)
          ),
      );
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    clearCartLocal: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },

    openCart: (state) => {
      state.isOpen = true;
      state.sheetMode = "cart";
    },

    openVariantSelection: (state, action) => {
      state.isOpen = true;
      state.sheetMode = "variant";
      state.selectedProduct = action.payload;
    },

    closeSheet: (state) => {
      state.isOpen = false;
      state.selectedProduct = null;
    },

    setSheetMode: (state, action) => {
      state.sheetMode = action.payload;
    },
  },
});

export const {
  setCartItems,
  addToCartLocal,
  updateQuantityLocal,
  removeFromCartLocal,
  clearCartLocal,
  openCart,
  openVariantSelection,
  closeSheet,
  setSheetMode,
} = cartSlice.actions;

export default cartSlice.reducer;
