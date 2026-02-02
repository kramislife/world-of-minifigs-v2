import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Logo from "@/assets/media/Logo.png";
import { useCart, useVariantSelection } from "@/hooks/useCart";

const CartSheet = () => {
  const {
    items,
    totalQuantity,
    totalPrice,
    isOpen,
    closeSheet,
    sheetMode,
    selectedProduct,
    addToCart,
    updateQuantity,
    removeItem,
    setSheetMode,
    isUpdating,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent className="sm:max-w-lg">
        {sheetMode === "cart" ? (
          <CartView
            items={items}
            totalPrice={totalPrice}
            totalQuantity={totalQuantity}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            closeSheet={closeSheet}
            isUpdating={isUpdating}
          />
        ) : (
          selectedProduct && (
            <VariantSelectionView
              product={selectedProduct}
              onAddToCart={addToCart}
              switchToCart={() => setSheetMode("cart")}
              isAddingToCart={isUpdating}
            />
          )
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ----------------------------- Cart View ----------------------------- */

const CartView = ({
  items,
  totalPrice,
  totalQuantity,
  updateQuantity,
  removeItem,
  closeSheet,
  isUpdating,
}) => (
  <div className="flex flex-col h-full relative">
    <SheetHeader className="p-5 border-b flex flex-row items-center justify-between">
      <SheetTitle className="text-2xl font-bold uppercase">
        Your Cart
        <sup className="text-sm font-bold text-muted-foreground ml-2">
          {totalQuantity}
        </sup>
      </SheetTitle>
      <SheetDescription className="sr-only">
        This is your shopping cart
      </SheetDescription>
    </SheetHeader>

    <div className="flex-1 p-5">
      {items.length === 0 && !isUpdating ? (
        <EmptyCartView onContinue={closeSheet} />
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.variantIndex || "default"}`}
              item={item}
              onUpdate={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
      )}
    </div>

    {items.length > 0 && (
      <div className="p-5 border-t space-y-5">
        <div className="flex justify-between">
          <span className="text-lg font-black uppercase">Subtotal</span>
          <span className="text-2xl font-black text-success">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <Button variant="dark" className="w-full h-12">
          Checkout
        </Button>
      </div>
    )}

    {isUpdating && (
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50 transition-all duration-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-accent" />
          <p className="text-xs font-black uppercase tracking-widest">
            Updating your cart...
          </p>
        </div>
      </div>
    )}
  </div>
);

const EmptyCartView = ({ onContinue }) => (
  <div className="h-full flex flex-col items-center justify-center text-center">
    <h1 className="text-5xl font-black uppercase max-w-md pb-10">
      Your cart looks lonely
    </h1>
    <Button
      variant="bannerOutline"
      className="text-black border-black hover:bg-black hover:text-white duration-300"
      onClick={onContinue}
      asChild
    >
      <Link to="/products">Start Shopping</Link>
    </Button>
  </div>
);

const CartItem = ({ item, onUpdate, onRemove }) => {
  const {
    productId,
    productName,
    variantIndex,
    quantity,
    image,
    variantColor,
    secondaryColor,
    displayPrice,
    totalItemPrice,
    stock,
  } = item;

  return (
    <div className="flex gap-3 group pb-5 border-b last:border-0 last:pb-0">
      <div className="relative w-28 h-28 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 border">
            <img
              src={Logo}
              alt="No image"
              className="w-full h-full object-contain opacity-50"
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <h4
              className="font-bold text-sm leading-tight line-clamp-1 min-w-0"
              title={productName}
            >
              {productName}
            </h4>
            <span className="font-black text-sm text-success whitespace-nowrap">
              ${totalItemPrice}
            </span>
          </div>

          <div className="mt-1 space-y-2">
            <p className="text-xs font-bold text-foreground">${displayPrice}</p>
            {(variantColor || secondaryColor) && (
              <p className="text-xs text-muted-foreground">
                {[variantColor, secondaryColor].filter(Boolean).join(" / ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border rounded-sm">
            <Button
              variant="ghost"
              size="sm"
              className="text-black hover:bg-transparent disabled:opacity-30"
              onClick={() =>
                onUpdate(Math.max(1, quantity - 1), productId, variantIndex)
              }
              disabled={quantity <= 1}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-8 text-center text-xs font-bold">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-black hover:bg-transparent disabled:opacity-30"
              onClick={() => onUpdate(quantity + 1, productId, variantIndex)}
              disabled={quantity >= stock}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-transparent"
            onClick={() => onRemove(productId, variantIndex)}
            title="Remove item"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- Variant View ----------------------------- */

const VariantSelectionView = ({
  product,
  onAddToCart,
  switchToCart,
  isAddingToCart,
}) => {
  const {
    selectedVariantIndex: idx,
    setSelectedVariantIndex: setIdx,
    selectedVariant,
    carouselImages,
    normalizedColorVariants,
    selectedColorName,
    displayPrice,
    originalPrice,
    hasDiscount,
    setApi,
    handleAdd,
  } = useVariantSelection({
    product,
    onAddToCart,
    switchToCart,
  });

  return (
    <>
      <SheetHeader className="p-5 border-b flex flex-row items-center justify-between">
        <SheetTitle className="text-2xl font-bold uppercase">
          Choose Options
        </SheetTitle>
        <SheetDescription className="sr-only">
          Select a variant for {product.productName}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          <Carousel
            setApi={setApi}
            opts={{ align: "start" }}
            className="w-full"
          >
            <CarouselContent>
              {carouselImages.map((img, i) => (
                <CarouselItem key={i} className="basis-1/2">
                  <div
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      idx === i ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={product.productName}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="px-5 space-y-5">
          <div className="mt-3">
            <h3 className="text-3xl font-bold">{product.productName}</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-success">
                ${displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          {normalizedColorVariants.length > 0 && (
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Color:{" "}
                <span className="text-foreground">{selectedColorName}</span>
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {normalizedColorVariants.map((v) => (
                  <Button
                    key={v.index}
                    variant="ghost"
                    size="icon"
                    onClick={() => setIdx(v.index)}
                    className={`relative size-6 rounded-full border-2 transition-all p-0 hover:bg-transparent group ${
                      idx === v.index
                        ? "border-accent"
                        : "border-border hover:border-destructive"
                    }`}
                    style={
                      v.secondaryHexCode
                        ? {
                            background: `linear-gradient(135deg, ${v.hexCode || "#ccc"} 50%, ${v.secondaryHexCode} 50%)`,
                          }
                        : {
                            backgroundColor: v.hexCode || "#ccc",
                          }
                    }
                    title={
                      v.secondaryColorName
                        ? `${v.colorName} / ${v.secondaryColorName}`
                        : v.colorName
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t">
        <Button
          variant="dark"
          className="w-full h-12"
          onClick={handleAdd}
          disabled={!(selectedVariant?.stock > 0) || isAddingToCart}
        >
          {isAddingToCart && <Loader2 className="size-4 animate-spin mr-2" />}
          {selectedVariant?.stock > 0
            ? isAddingToCart
              ? "Adding..."
              : "Add to Cart"
            : "Out of Stock"}
        </Button>
      </div>
    </>
  );
};

export default CartSheet;
