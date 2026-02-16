import {
  dealerHero,
  dealerFeatures,
  dealerProcess,
  dealerIncluded,
  dealerBenefits,
} from "@/constant/dealerData";
import PageHero from "@/components/shared/PageHero";
import SectionWithCards from "@/components/shared/SectionWithCards";
import ErrorState from "@/components/shared/ErrorState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import DealerBundle from "@/components/dealer/DealerBundle";
import DealerAddon from "@/components/dealer/DealerAddon";
import DealerExtraBag from "@/components/dealer/DealerExtraBag";
import DealerTorsoBag from "@/components/dealer/DealerTorsoBag";
import DealerOrderSummary from "@/components/dealer/DealerOrderSummary";
import AddonPreviewModal from "@/components/dealer/AddonPreviewModal";
import { useDealer } from "@/hooks/useDealer";

const Dealer = () => {
  const {
    // States & Setters
    setSelectedBundleId,
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

    // Bundle Type Info
    isCustomBundle,
    multiplier,
    miscQuantity,
    displayItems,

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
  } = useDealer();

  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-screen" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load dealer packages"
        description="We're experiencing issues loading dealer packages. Please refresh the page or contact support if the problem persists."
        minHeight="min-h-screen"
      />
    );
  }

  if (!bundles) {
    return (
      <ErrorState
        title="No dealer packages available"
        description="No dealer packages are currently available. Please check back soon!"
        minHeight="min-h-screen"
      />
    );
  }

  return (
    <>
      <PageHero
        title={dealerHero.title}
        highlight={dealerHero.highlight}
        description={dealerHero.description}
        badge={dealerHero.badge}
        features={dealerFeatures}
      />

      {/* How it works */}
      <SectionWithCards
        badge={dealerProcess.badge}
        title={dealerProcess.title}
        items={dealerProcess.steps}
        gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      />

      {/* Parts Breakdown */}
      <SectionWithCards
        badge={dealerIncluded.badge}
        title={dealerIncluded.title}
        description={dealerIncluded.description}
        items={dealerIncluded.items}
        gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        background={true}
      />

      {/* Why Partner with Us */}
      <SectionWithCards
        badge={dealerBenefits.badge}
        title={dealerBenefits.title}
        description={dealerBenefits.description}
        items={dealerBenefits.features}
      />

      <DealerBundle bundles={bundles} onSelect={setSelectedBundleId} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 px-5 py-10 items-start overflow-visible bg-input/50 dark:bg-card/50">
        <div className="space-y-10 overflow-visible">
          <DealerAddon
            addons={addons}
            onSelect={setSelectedAddonId}
            onPreview={setSelectedAddon}
          />

          <DealerExtraBag
            extraBags={extraBags}
            totalExtraBags={totalExtraBags}
            maxExtraBags={maxExtraBags}
            selectedBundle={selectedBundle}
            onIncrease={handleIncreaseBag}
            onDecrease={handleDecreaseBag}
          />

          <DealerTorsoBag
            torsoBags={torsoBags}
            lastSelectedBag={lastSelectedBag}
            onSelect={handleSelectTorsoBag}
            isAdmin={isAdmin}
            isCustomBundle={isCustomBundle}
            multiplier={multiplier}
            miscQuantity={miscQuantity}
            displayItems={displayItems}
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

        <DealerOrderSummary
          selectedBundle={selectedBundle}
          selectedAddonData={selectedAddonData}
          totalExtraBags={totalExtraBags}
          extraBagQuantities={extraBagQuantities}
          extraBags={extraBags}
          selectedTorsoBagIds={selectedTorsoBagIds}
          torsoBags={torsoBags}
          isCustomBundle={isCustomBundle}
          multiplier={multiplier}
          miscQuantity={miscQuantity}
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
    </>
  );
};

export default Dealer;
