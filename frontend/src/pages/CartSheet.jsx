import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CartView from "@/components/cart/CartView";
import VariantSelectionView from "@/components/cart/VariantSelectionView";
import { useCart } from "@/hooks/useCart";

const CartSheet = () => {
  const {
    items,
    totalPriceFormatted,
    totalQuantity,
    isOpen,
    closeSheet,
    sheetMode,
    selectedProduct,
    handleQuantityDecrement,
    handleQuantityIncrement,
    removeItem,
    setSheetMode,
    handleCheckout,
    isUpdating,
    isCheckoutLoading,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="sm:max-w-lg">
        {sheetMode === "cart" ? (
          <CartView
            items={items}
            totalPriceFormatted={totalPriceFormatted}
            totalQuantity={totalQuantity}
            onQuantityDecrement={handleQuantityDecrement}
            onQuantityIncrement={handleQuantityIncrement}
            removeItem={removeItem}
            closeSheet={closeSheet}
            isUpdating={isUpdating}
            onCheckout={handleCheckout}
            isCheckoutLoading={isCheckoutLoading}
          />
        ) : (
          selectedProduct && (
            <VariantSelectionView
              product={selectedProduct}
              switchToCart={() => setSheetMode("cart")}
            />
          )
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
