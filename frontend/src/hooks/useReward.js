import { useState, useMemo, useEffect } from "react";
import {
  useGetRewardBundlesQuery,
  useGetRewardAddonsQuery,
} from "@/redux/api/publicApi";

export const useReward = () => {
  const [selectedQuantity, setSelectedQuantity] = useState(8);
  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [selectedAddonId, setSelectedAddonId] = useState(null);

  const {
    data: bundleData,
    isLoading: isLoadingBundles,
    isError: isErrorBundles,
  } = useGetRewardBundlesQuery();
  const {
    data: addonData,
    isLoading: isLoadingAddons,
    isError: isErrorAddons,
  } = useGetRewardAddonsQuery();

  const bundles = bundleData?.bundles || [];
  const addons = addonData?.addons || [];

  // Add isSelected property to bundles
  const bundlesWithSelection = useMemo(() => {
    return bundles.map((bundle) => ({
      ...bundle,
      isSelected: selectedBundleId === bundle._id,
    }));
  }, [bundles, selectedBundleId]);

  // Auto-select first bundle as default
  useEffect(() => {
    if (bundles.length > 0 && !selectedBundleId) {
      setSelectedBundleId(bundles[0]._id);
    }
  }, [bundles, selectedBundleId]);

  // Filter addons by selected quantity
  const filteredAddons = useMemo(() => {
    return addons.filter((addon) => addon.quantity === selectedQuantity);
  }, [addons, selectedQuantity]);

  // Sort by duration: 3, 6, 12 months and add isSelected property
  const sortedAddons = useMemo(() => {
    return filteredAddons
      .sort((a, b) => a.duration - b.duration)
      .map((addon) => ({
        ...addon,
        isSelected: selectedAddonId === addon._id,
      }));
  }, [filteredAddons, selectedAddonId]);

  // Reset selected addon if it's not in the filtered list when quantity changes
  useEffect(() => {
    if (
      selectedAddonId &&
      !filteredAddons.find((addon) => addon._id === selectedAddonId)
    ) {
      setSelectedAddonId(null);
    }
  }, [filteredAddons, selectedAddonId]);

  // Get selected bundle and addon
  const selectedBundle = useMemo(
    () => bundlesWithSelection.find((b) => b._id === selectedBundleId),
    [bundlesWithSelection, selectedBundleId],
  );

  const selectedAddon = useMemo(
    () => sortedAddons.find((a) => a._id === selectedAddonId),
    [sortedAddons, selectedAddonId],
  );

  // Calculate total order price (bundle + monthly addon price only)
  const totalOrderPrice = useMemo(() => {
    const bundlePrice = selectedBundle?.totalPrice || 0;
    const addonMonthlyPrice = selectedAddon ? selectedAddon.price || 0 : 0;
    return bundlePrice + addonMonthlyPrice;
  }, [selectedBundle, selectedAddon]);

  const isLoading = isLoadingBundles || isLoadingAddons;
  const isError = isErrorBundles || isErrorAddons;

  const errorMessage =
    bundleData?.message ||
    addonData?.message ||
    "An unexpected error occurred. Please refresh or contact support.";

  // Handler functions
  const handleSelectAddon = (addonId) => {
    setSelectedAddonId(addonId === selectedAddonId ? null : addonId);
  };

  const handleQuantityChange = (quantity) => {
    setSelectedQuantity(quantity);
    // Reset selected addon when quantity changes
    setSelectedAddonId(null);
  };

  // Quantity options for toggle with isSelected property
  const quantityOptions = useMemo(
    () => [
      { value: 8, label: "8 Minifigs", isSelected: selectedQuantity === 8 },
      { value: 16, label: "16 Minifigs", isSelected: selectedQuantity === 16 },
    ],
    [selectedQuantity]
  );

  return {
    // States & Setters
    setSelectedBundleId,

    // Data
    bundles: bundlesWithSelection,
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
  };
};
