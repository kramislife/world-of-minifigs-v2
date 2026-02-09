import { Badge } from "@/components/ui/badge";
import RewardBundle from "@/components/reward/RewardBundle";
import RewardAddon from "@/components/reward/RewardAddon";
import RewardOrderSummary from "@/components/reward/RewardOrderSummary";
import { useReward } from "@/hooks/useReward";

const RewardProgram = () => {
  const {
    // States & Setters
    setSelectedBundleId,

    // Data
    bundles,
    sortedAddons,
    quantityOptions,

    // Memos
    selectedBundle,
    selectedAddon,
    totalOrderPrice,

    // Handlers
    handleSelectAddon,
    handleQuantityChange,

    // Status
    isLoading,
    isLoadingAddons,
    isError,
    errorMessage,
  } = useReward();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Loading reward bundles...</p>
      </div>
    );
  }

  if (isError || !bundles || bundles.length === 0) {
    return (
      <div className="px-5 py-20 min-h-[50vh] flex flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-destructive mb-2">
          Error loading reward program
        </p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <section className="px-5 py-10">
      <div className="text-center mb-10">
        <Badge variant="accent" className="px-3 py-1 text-sm">
          LAUNCH SPECIAL
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-5 mb-3">
          Build-A-Minifig <span className="text-accent">Reward Program</span>
        </h2>
        <p className="max-w-4xl mx-auto">
          Start with a curated kit and grow your collection with optional
          monthly subscriptions. Collect at your own pace, reward progress, and
          build memories.
        </p>
      </div>

      {/* Bundle Cards, Add-ons, and Order Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start overflow-visible">
        <div className="space-y-10 overflow-visible">
          <RewardBundle bundles={bundles} onSelect={setSelectedBundleId} />

          {!isLoadingAddons && sortedAddons.length > 0 && (
            <RewardAddon
              addons={sortedAddons}
              quantityOptions={quantityOptions}
              onSelect={handleSelectAddon}
              onQuantityChange={handleQuantityChange}
            />
          )}
        </div>

        <RewardOrderSummary
          selectedBundle={selectedBundle}
          selectedAddon={selectedAddon}
          totalOrderPrice={totalOrderPrice}
        />
      </div>
    </section>
  );
};

export default RewardProgram;
