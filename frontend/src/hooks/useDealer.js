import { useState, useMemo, useEffect } from "react";
import {
  useGetDealerBundlesQuery,
  useGetDealerAddonsQuery,
  useGetDealerExtraBagsQuery,
  useGetDealerTorsoBagsQuery,
} from "@/redux/api/authApi";

export const useDealer = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [selectedAddonId, setSelectedAddonId] = useState(null);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [extraBagQuantities, setExtraBagQuantities] = useState({});
  const [selectedTorsoBagIds, setSelectedTorsoBagIds] = useState([]);

  const {
    data: bundleData,
    isLoading: isLoadingBundles,
    isError: isErrorBundles,
  } = useGetDealerBundlesQuery();

  const {
    data: addonData,
    isLoading: isLoadingAddons,
    isError: isErrorAddons,
  } = useGetDealerAddonsQuery();

  const {
    data: extraBagData,
    isLoading: isLoadingExtraBags,
    isError: isErrorExtraBags,
  } = useGetDealerExtraBagsQuery();

  const {
    data: torsoBagData,
    isLoading: isLoadingTorsoBags,
    isError: isErrorTorsoBags,
  } = useGetDealerTorsoBagsQuery();

  const bundles = bundleData?.bundles || [];
  const addons = addonData?.addons || [];
  const extraBags = extraBagData?.extraBags || [];
  const torsoBags = torsoBagData?.torsoBags || [];

  // Auto-select first bundle as default
  useEffect(() => {
    if (bundles.length > 0 && !selectedBundleId) {
      setSelectedBundleId(bundles[0]._id);
    }
  }, [bundles, selectedBundleId]);

  // Logic Constants
  const selectedBundle = useMemo(
    () => bundles.find((b) => b._id === selectedBundleId),
    [bundles, selectedBundleId],
  );

  const maxExtraBags = useMemo(() => {
    if (!selectedBundle) return 0;
    return Math.floor(selectedBundle.minifigQuantity / 100);
  }, [selectedBundle]);

  const totalExtraBags = useMemo(() => {
    return Object.values(extraBagQuantities).reduce((acc, qty) => acc + qty, 0);
  }, [extraBagQuantities]);

  // Validation: If bundle change reduces max bags below current count, reset selections
  useEffect(() => {
    if (totalExtraBags > maxExtraBags) {
      setExtraBagQuantities({});
    }
  }, [maxExtraBags, totalExtraBags]);

  const handleIncreaseBag = (bagId) => {
    if (totalExtraBags >= maxExtraBags) return;
    setExtraBagQuantities((prev) => ({
      ...prev,
      [bagId]: (prev[bagId] || 0) + 1,
    }));
  };

  const handleDecreaseBag = (bagId) => {
    if (!extraBagQuantities[bagId] || extraBagQuantities[bagId] <= 0) return;
    setExtraBagQuantities((prev) => ({
      ...prev,
      [bagId]: prev[bagId] - 1,
    }));
  };

  const maxAllowedTorsoBags = useMemo(() => {
    if (!selectedBundle) return 0;
    return 1;
  }, [selectedBundle]);

  const handleSelectTorsoBag = (bagId) => {
    if (selectedTorsoBagIds.includes(bagId)) {
      setSelectedTorsoBagIds([]);
      return;
    }

    setSelectedTorsoBagIds([bagId]);
  };

  const lastSelectedBag = useMemo(() => {
    if (selectedTorsoBagIds.length === 0) return null;
    const lastId = selectedTorsoBagIds[selectedTorsoBagIds.length - 1];
    return torsoBags.find((b) => b._id === lastId);
  }, [selectedTorsoBagIds, torsoBags]);

  const selectedAddonData = useMemo(
    () => addons.find((a) => a._id === selectedAddonId),
    [addons, selectedAddonId],
  );

  const extraBagsCost = useMemo(() => {
    return extraBags.reduce((total, bag) => {
      const qty = extraBagQuantities[bag._id] || 0;
      return total + (bag.price || 0) * qty;
    }, 0);
  }, [extraBags, extraBagQuantities]);

  const totalOrderPrice = useMemo(() => {
    return (
      (selectedBundle?.totalPrice || 0) +
      (selectedAddonData?.price || 0) +
      extraBagsCost +
      10 // Flat rate shipping
    );
  }, [selectedBundle, selectedAddonData, extraBagsCost]);

  const isLoading =
    isLoadingBundles ||
    isLoadingAddons ||
    isLoadingExtraBags ||
    isLoadingTorsoBags;

  const isError =
    isErrorBundles || isErrorAddons || isErrorExtraBags || isErrorTorsoBags;

  const errorMessage =
    bundleData?.message ||
    addonData?.message ||
    extraBagData?.message ||
    torsoBagData?.message ||
    "An unexpected error occurred. Please refresh or contact support.";

  return {
    // States & Setters
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
    maxAllowedTorsoBags,
    lastSelectedBag,
    selectedAddonData,
    extraBagsCost,
    totalOrderPrice,

    // Handlers
    handleIncreaseBag,
    handleDecreaseBag,
    handleSelectTorsoBag,

    // Status
    isLoading,
    isError,
    errorMessage,
  };
};
