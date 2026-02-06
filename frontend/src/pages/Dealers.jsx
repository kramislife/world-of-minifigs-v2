import React from "react";
import { Plus, Minus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Logo from "@/assets/media/Logo.png";
import Auth from "@/pages/Auth";
import {
  dealerHero,
  dealerFeatures,
  dealerProcess,
  dealerIncluded,
  dealerBenefits,
} from "@/constant/dealerData";
import { useDealer } from "@/hooks/useDealer";

const Dealers = () => {
  const {
    // States
    authOpen,
    setAuthOpen,
    selectedBundleId,
    setSelectedBundleId,
    selectedAddonId,
    setSelectedAddonId,
    selectedAddon,
    setSelectedAddon,
    extraBagQuantities,
    selectedTorsoBagIds,

    // Data
    bundles,
    addons,
    extraBags,
    torsoBags,

    // Memos
    selectedBundle,
    maxExtraBags,
    totalExtraBags,
    lastSelectedBag,
    selectedAddonData,
    totalOrderPrice,

    // Handlers
    handleIncreaseBag,
    handleDecreaseBag,
    handleSelectTorsoBag,

    // Status
    isLoading,
    isError,
    errorMessage,
  } = useDealer();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-5 py-20 min-h-[50vh] flex flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-destructive mb-2">
          Error loading dealer packages
        </p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <Auth open={authOpen} onOpenChange={setAuthOpen} defaultTab="register" />
      {/* Hero */}
      <section className="relative overflow-hidden py-35 border border-border/50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-64 h-64 md:w-96 md:h-96 rounded-full bg-accent" />
          <div className="absolute top-1/2 right-1/4 w-56 h-56 md:w-64 md:h-64 rounded-full bg-accent" />
          <div className="absolute -bottom-32 -right-32 w-52 h-52 md:w-64 md:h-64 rounded-full bg-accent" />
        </div>

        <div className="relative text-center flex flex-col items-center px-5">
          <Badge variant="accent" className="px-3 py-1 text-sm">
            {dealerHero.badge}
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold my-5 leading-tight">
            {dealerHero.title}{" "}
            <span className="text-accent">{dealerHero.highlight}</span>
          </h1>

          <div className="mx-auto max-w-xl mb-5">
            <p className="text-sm md:text-lg">{dealerHero.description}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {dealerFeatures.map((feature, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-2 text-sm border-border flex items-center gap-3 bg-card text-foreground"
              >
                <feature.icon size={18} className="text-accent" />
                {feature.label}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Easy Process */}
      <section className="px-5 py-10">
        <div className="space-y-4 leading-relaxed text-center">
          <Badge variant="accent" className="px-3 py-1 text-sm">
            {dealerProcess.badge}
          </Badge>
          <h2 className="text-4xl font-bold leading-tight">
            {dealerProcess.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-5">
          {dealerProcess.steps.map((step, index) => (
            <Card key={index} className="text-center dark:shadow-none">
              <CardHeader>
                <div className="text-foreground dark:text-secondary-foreground font-bold mb-5 bg-accent h-20 w-20 mx-auto rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                  <step.icon size={32} strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl font-bold">
                  {step.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription className="leading-relaxed text-accent-foreground dark:text-foreground">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Parts Breakdown */}
      <section className="px-5 py-10 bg-input/50 dark:bg-card/50">
        <div className="text-center mb-10">
          <Badge variant="accent" className="px-3 py-1 text-sm">
            {dealerIncluded.badge}
          </Badge>
          <h2 className="text-4xl font-bold mt-5 mb-3">
            {dealerIncluded.title}{" "}
            <span className="text-accent">{dealerIncluded.highlight}</span>
          </h2>
          <p className="max-w-3xl mx-auto">{dealerIncluded.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 text-center">
          {dealerIncluded.items.map((item, index) => (
            <Card
              key={index}
              className="text-center dark:shadow-none bg-background/50 border-border"
            >
              <CardHeader>
                <div className="text-foreground dark:text-secondary-foreground font-bold mb-5 bg-accent h-20 w-20 mx-auto rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                  <item.icon size={24} strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl font-bold">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-accent-foreground dark:text-foreground">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center mt-10 text-sm font-medium max-w-2xl mx-auto">
          {dealerIncluded.footer}
        </p>
      </section>

      {/* Dealer Exclusive */}
      <section className="py-10 px-5">
        <div className="text-center mb-10">
          <Badge variant="accent" className="px-3 py-1 text-sm">
            {dealerBenefits.badge}
          </Badge>
          <h2 className="text-4xl font-bold mt-5 mb-3">
            {dealerBenefits.title}{" "}
            <span className="text-accent">{dealerBenefits.highlight}</span>
          </h2>
          <p className="max-w-3xl mx-auto">{dealerBenefits.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-center">
          {dealerBenefits.features.map((feature, index) => (
            <Card key={index} className="text-center dark:shadow-none">
              <CardHeader>
                <div className="text-foreground dark:text-secondary-foreground font-bold mb-5 bg-accent h-20 w-20 mx-auto rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-accent-foreground dark:text-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <BundleSelection
        bundles={bundles}
        selectedBundleId={selectedBundleId}
        onSelect={setSelectedBundleId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 px-5 py-10 items-start overflow-visible bg-input/50 dark:bg-card/50">
        <div className="space-y-10 overflow-visible">
          <AddonSelection
            addons={addons}
            selectedAddonId={selectedAddonId}
            onSelect={setSelectedAddonId}
            onPreview={setSelectedAddon}
          />

          <ExtraBagSelection
            extraBags={extraBags}
            extraBagQuantities={extraBagQuantities}
            totalExtraBags={totalExtraBags}
            maxExtraBags={maxExtraBags}
            selectedBundle={selectedBundle}
            onIncrease={handleIncreaseBag}
            onDecrease={handleDecreaseBag}
          />

          <TorsoSelection
            torsoBags={torsoBags}
            selectedTorsoBagIds={selectedTorsoBagIds}
            lastSelectedBag={lastSelectedBag}
            onSelect={handleSelectTorsoBag}
          />
        </div>

        <OrderSummary
          selectedBundle={selectedBundle}
          selectedAddonData={selectedAddonData}
          totalExtraBags={totalExtraBags}
          extraBagQuantities={extraBagQuantities}
          extraBags={extraBags}
          selectedTorsoBagIds={selectedTorsoBagIds}
          torsoBags={torsoBags}
          totalOrderPrice={totalOrderPrice}
          onCheckout={() => setAuthOpen(true)}
        />
      </div>

      <AddonPreviewModal
        addon={selectedAddon}
        onClose={() => setSelectedAddon(null)}
        onSelect={(id) => {
          setSelectedAddonId(id);
          setSelectedAddon(null);
        }}
      />
    </div>
  );
};

/* --- Sub-Components --- */

const BundleSelection = ({ bundles, selectedBundleId, onSelect }) => (
  <section className="px-5 py-10 bg-input/50 dark:bg-card/50">
    <div className="text-left mb-12">
      <h2 className="text-2xl font-bold mb-2 tracking-tight">
        Step 1 — Select Your Bag Quantity
      </h2>
      <p className="text-muted-foreground text-sm">
        Choose up to 300+ top-quality, 100% genuine LEGO minifigures
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {bundles.map((bundle) => {
        const isSelected = selectedBundleId === bundle._id;
        return (
          <Card
            key={bundle._id}
            onClick={() => onSelect(bundle._id)}
            className={`relative cursor-pointer transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 p-5 ${
              isSelected ? "border-accent ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            {isSelected && (
              <Badge
                variant="accent"
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 whitespace-nowrap z-10 uppercase"
              >
                Current Selection
              </Badge>
            )}

            <h3 className="text-2xl font-bold mt-3 text-left">
              {bundle.bundleName}
            </h3>

            <div className="w-full flex flex-col mt-3">
              <span className="text-5xl font-extrabold text-success dark:text-accent">
                ${bundle.totalPrice}
              </span>
              <span className="text-xs text-primary font-semibold mt-2">
                ${bundle.unitPrice?.toFixed(2)} / each
              </span>
            </div>

            <ul className="space-y-3 flex-1 w-full overflow-hidden border-t border-dashed border-border pt-5">
              {bundle.features?.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm leading-tight"
                >
                  <Check size={16} className="text-primary" />
                  <span className="text-muted-foreground/90 line-clamp-2">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  </section>
);

const AddonSelection = ({ addons, selectedAddonId, onSelect, onPreview }) => (
  <section id="step2">
    <div className="text-left mb-10">
      <h2 className="text-2xl font-bold mb-2 tracking-tight">
        Step 2 — Secure Your Bag Add-Ons
      </h2>
      <p className="text-muted-foreground text-sm">
        Select premium part packages to enhance your bulk order
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {addons.map((addon) => {
        const hasItems = addon.items?.length > 0;
        const isSelected = selectedAddonId === addon._id;
        return (
          <Card
            key={addon._id}
            onClick={() => {
              if (isSelected) {
                onSelect(null);
              } else {
                hasItems ? onPreview(addon) : onSelect(addon._id);
              }
            }}
            className={`relative cursor-pointer transition-all duration-300 group gap-2 hover:shadow-2xl hover:-translate-y-2 p-5 ${
              isSelected ? "border-accent ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            {isSelected && (
              <Badge
                variant="accent"
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 whitespace-nowrap z-10 uppercase"
              >
                Current Selection
              </Badge>
            )}

            <h3 className="text-2xl font-bold text-left">{addon.addonName}</h3>

            <p className="text-sm text-muted-foreground leading-tight line-clamp-2">
              {addon.description}
            </p>

            <div className="w-full flex flex-col mt-5">
              <span className="text-5xl font-extrabold text-success dark:text-accent">
                ${addon.price}
              </span>
              <span className="text-xs text-muted-foreground mt-2">
                add-on price
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  </section>
);

const ExtraBagSelection = ({
  extraBags,
  extraBagQuantities,
  totalExtraBags,
  maxExtraBags,
  selectedBundle,
  onIncrease,
  onDecrease,
}) => (
  <section id="step3" className="overflow-visible">
    <div className="flex flex-col mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Step 3 — Extra Part Bag Options
        </h2>
        {selectedBundle && (
          <Badge variant="outline" className="flex items-center">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold">{totalExtraBags}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-bold">
                {maxExtraBags} extra bags
              </span>
            </div>
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        Add additional part bags to your order based on your selected bundle
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {extraBags.map((bag) => {
        const qty = extraBagQuantities[bag._id] || 0;
        const canIncrease = totalExtraBags < maxExtraBags;
        const canDecrease = qty > 0;

        return (
          <Card
            key={bag._id}
            className={`p-5 transition-all duration-300 group overflow-visible hover:shadow-2xl hover:-translate-y-2 flex flex-col gap-2 ${
              qty > 0 ? "border-accent ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            <h3 className="text-xl font-bold text-left">
              {bag.subCollectionId?.subCollectionName || "Extra Bag"}
            </h3>

            <div className="w-full flex flex-col mt-3">
              <span className="text-5xl font-extrabold text-success dark:text-accent">
                ${bag.price}
              </span>
              <span className="text-xs text-muted-foreground mt-2">
                per extra bag
              </span>
            </div>

            <div className="flex items-center justify-between border rounded-md w-full mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-black hover:bg-transparent disabled:opacity-30"
                onClick={() => onDecrease(bag._id)}
                disabled={!canDecrease}
              >
                <Minus className="size-4" />
              </Button>
              <span className="text-center text-sm font-bold flex-1">
                {qty}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-black hover:bg-transparent disabled:opacity-30"
                onClick={() => onIncrease(bag._id)}
                disabled={!canIncrease}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  </section>
);

const TorsoSelection = ({
  torsoBags,
  selectedTorsoBagIds,
  lastSelectedBag,
  onSelect,
}) => (
  <section id="step4" className="overflow-visible">
    <div className="text-left mb-10">
      <h2 className="text-2xl font-bold mb-2 tracking-tight">
        Step 4 — Choose Your LEGO Torso
      </h2>
      <p className="text-muted-foreground text-sm">
        Select your preferred torso bag design.
      </p>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {torsoBags.map((bag) => {
        const isSelected = selectedTorsoBagIds.includes(bag._id);
        const firstImage = bag.items?.[0]?.image?.url;
        return (
          <Card
            key={bag._id}
            onClick={() => onSelect(bag._id)}
            className={`relative cursor-pointer transition-all duration-300 group p-0 gap-0 overflow-visible hover:shadow-2xl hover:-translate-y-2 ${
              isSelected ? "border-accent ring-2 ring-accent ring-offset-2" : ""
            }`}
          >
            {isSelected && (
              <Badge
                variant="accent"
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 whitespace-nowrap z-10 uppercase"
              >
                Current Selection
              </Badge>
            )}

            <div className="aspect-square flex items-center justify-center">
              {firstImage ? (
                <img
                  src={firstImage}
                  alt={bag.bagName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={Logo}
                  alt="Placeholder"
                  className="max-h-40 max-w-40 object-contain opacity-80"
                />
              )}
            </div>

            <div
              className={`p-2 text-center border-t transition-colors ${
                isSelected ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <h3 className="text-lg font-bold font-mono uppercase tracking-tight">
                {bag.bagName}
              </h3>
            </div>
          </Card>
        );
      })}
    </div>

    {lastSelectedBag && (
      <div className="mt-10 space-y-5 pt-5 border-t border-dashed">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">
              {lastSelectedBag.bagName} Preview
            </h3>
            <p className="text-muted-foreground text-sm">
              {lastSelectedBag.items?.length || 0} unique designs • Premium
              printed genuine LEGO torsos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {lastSelectedBag.items?.map((item, idx) => (
            <Card key={idx} className="relative p-0 border-border shadow-none">
              <div className="aspect-square rounded-md flex items-center justify-center relative overflow-hidden">
                <Badge
                  variant="accent"
                  className="absolute top-1 right-1 size-5"
                >
                  {item.quantity}
                </Badge>
                {item.image?.url ? (
                  <img
                    src={item.image.url}
                    alt={`Torso ${idx}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={Logo}
                    alt="Placeholder"
                    className="max-h-40 max-w-40 object-contain opacity-80"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    )}
  </section>
);

const OrderSummary = ({
  selectedBundle,
  selectedAddonData,
  totalExtraBags,
  extraBagQuantities,
  extraBags,
  selectedTorsoBagIds,
  torsoBags,
  totalOrderPrice,
  onCheckout,
}) => (
  <aside className="lg:sticky lg:top-24 space-y-5">
    <Card className="border-2 border-accent overflow-hidden p-0">
      <div className="bg-accent p-4 text-accent-foreground">
        <h3 className="text-lg font-bold uppercase">Order Summary</h3>
      </div>

      <div className="px-3 py-1 space-y-5">
        {selectedBundle && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-bold">{selectedBundle.bundleName}</p>
                <p className="text-xs text-muted-foreground">
                  ${selectedBundle.unitPrice?.toFixed(2)} / each
                </p>
              </div>
              <p className="text-sm font-bold text-primary dark:text-accent">
                ${selectedBundle.totalPrice?.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {selectedAddonData && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold">{selectedAddonData.addonName}</p>
              <span className="text-sm font-bold text-primary dark:text-accent">
                ${selectedAddonData.price?.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {totalExtraBags > 0 && (
          <div className="space-y-3 pb-3 border-b border-dashed">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                Extra Bags ({totalExtraBags})
              </span>
            </div>
            <div className="space-y-2">
              {extraBags.map((bag) => {
                const qty = extraBagQuantities[bag._id] || 0;
                if (qty === 0) return null;
                return (
                  <div
                    key={bag._id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-bold">
                      {qty} x {bag.subCollectionId?.subCollectionName}
                    </span>
                    <span className="font-bold shrink-0 text-primary dark:text-accent">
                      ${(bag.price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTorsoBagIds.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-dashed">
            {selectedTorsoBagIds.map((id) => {
              const bag = torsoBags.find((b) => b._id === id);
              return (
                <div
                  key={id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-bold">{bag?.bagName}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3 pb-3 border-b border-dashed">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold">Flat Rate Shipping</p>
            <span className="text-sm font-bold text-primary dark:text-accent">
              $10.00
            </span>
          </div>
        </div>

        <div className="pt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold uppercase">Estimated Total</span>
            <div className="text-right">
              <p className="text-3xl font-bold text-success dark:text-accent">
                ${totalOrderPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="dark"
          className="w-full h-12 mb-3"
          disabled={!selectedBundle || selectedTorsoBagIds.length === 0}
          onClick={onCheckout}
        >
          Checkout
        </Button>
      </div>
    </Card>
  </aside>
);

const AddonPreviewModal = ({ addon, onClose, onSelect }) => {
  if (!addon) return null;

  return (
    <Dialog open={!!addon} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl overflow-hidden flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>{addon.addonName} Items</DialogTitle>
          <DialogDescription className="sr-only">
            Review the parts included in this premium add-on before selecting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {addon.items?.map((item, index) => (
              <div
                key={index}
                className="p-0 border border-border rounded-md overflow-hidden shadow-none"
              >
                <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={Logo}
                      alt="Placeholder"
                      className="max-h-40 max-w-40 object-contain opacity-80"
                    />
                  )}
                </div>
                <div className="p-2 bg-background border-t border-border space-y-1">
                  <h3
                    className="text-md font-bold line-clamp-1"
                    title={item.itemName}
                  >
                    {item.itemName}
                  </h3>
                  {item.color && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-normal">
                        {item.color.colorName}
                      </span>
                    </div>
                  )}
                  {item.itemPrice > 0 && (
                    <p className="text-sm font-bold text-success dark:text-accent mt-1">
                      ${item.itemPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={() => onSelect(addon._id)}>
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Dealers;
