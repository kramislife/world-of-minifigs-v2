import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  dealerHero,
  dealerFeatures,
  dealerProcess,
  dealerIncluded,
  dealerBenefits,
} from "@/constant/dealerData";
import BundleSelection from "@/components/dealer/BundleSelection";
import AddonSelection from "@/components/dealer/AddonSelection";
import ExtraBagSelection from "@/components/dealer/ExtraBagSelection";
import TorsoSelection from "@/components/dealer/TorsoSelection";
import OrderSummary from "@/components/dealer/OrderSummary";
import AddonPreviewModal from "@/components/dealer/AddonPreviewModal";
import { useDealer } from "@/hooks/useDealer";

const Dealers = () => {
  const {
    // States
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

    // Reorder (Admin)
    localItems,
    hasReorderChanges,
    isSavingOrder,
    reorderSensors,
    reorderItemIds,
    handleReorderDragEnd,
    handleSaveReorder,
    handleResetReorder,

    // Status
    isAdmin,
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
            isAdmin={isAdmin}
            localItems={localItems}
            hasReorderChanges={hasReorderChanges}
            isSavingOrder={isSavingOrder}
            reorderSensors={reorderSensors}
            reorderItemIds={reorderItemIds}
            onDragEnd={handleReorderDragEnd}
            onSave={handleSaveReorder}
            onReset={handleResetReorder}
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

export default Dealers;
