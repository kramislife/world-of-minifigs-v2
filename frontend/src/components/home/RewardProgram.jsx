import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
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
  } = useReward();

  if (isLoading) {
    return <LoadingSpinner minHeight="min-h-[400px]" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Reward program unavailable"
        description="We're having trouble loading the reward program. Please try refreshing the page or check back later."
        minHeight="min-h-[400px]"
      />
    );
  }

  if (!bundles) {
    return (
      <ErrorState
        title="No reward bundles available"
        description="No reward bundles are currently available. Please check back soon for exciting reward options!"
        minHeight="min-h-[400px]"
      />
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
