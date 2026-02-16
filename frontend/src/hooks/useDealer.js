import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useGetDealerBundlesQuery,
  useGetDealerAddonsQuery,
  useGetDealerExtraBagsQuery,
  useGetDealerTorsoBagsQuery,
} from "@/redux/api/authApi";
import { useReorderTorsoBagItemsMutation } from "@/redux/api/adminApi";

export const useDealer = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [selectedAddonId, setSelectedAddonId] = useState(null);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [extraBagQuantities, setExtraBagQuantities] = useState({});
  const [selectedTorsoBagIds, setSelectedTorsoBagIds] = useState([]);

  // Torso reorder state
  const [localItems, setLocalItems] = useState([]);
  const [hasReorderChanges, setHasReorderChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // ==================== Data Fetching ====================

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

  const [reorderTorsoBagItems] = useReorderTorsoBagItemsMutation();

  const bundles = Array.isArray(bundleData?.bundles) ? bundleData.bundles : [];
  const addons = Array.isArray(addonData?.addons) ? addonData.addons : [];
  const extraBags = Array.isArray(extraBagData?.extraBags)
    ? extraBagData.extraBags
    : [];

  // ==================== Bundle Selection ====================

  // Auto-select first bundle as default
  useEffect(() => {
    if (bundles.length > 0 && !selectedBundleId) {
      setSelectedBundleId(bundles[0]._id);
    }
  }, [bundles, selectedBundleId]);

  const selectedBundle = useMemo(
    () => bundles.find((b) => b._id === selectedBundleId),
    [bundles, selectedBundleId],
  );

  // ==================== Bundle Type & Multiplier ====================

  // Find the smallest "regular" bundle = the base
  const baseBundleSize = useMemo(() => {
    const regularBundles = bundles.filter(
      (b) => (b.torsoBagType || "regular") === "regular",
    );
    if (regularBundles.length === 0) return 100;
    return Math.min(...regularBundles.map((b) => b.minifigQuantity));
  }, [bundles]);

  const isCustomBundle = selectedBundle?.torsoBagType === "custom";

  // The multiplier for regular bundles (e.g. 200 / 100 = x2)
  const multiplier = useMemo(() => {
    if (!selectedBundle || isCustomBundle) return 1;
    return Math.round(selectedBundle.minifigQuantity / baseBundleSize);
  }, [selectedBundle, isCustomBundle, baseBundleSize]);

  // Misc quantity from API (backend computes using MISC_RATIO)
  const miscQuantity = selectedBundle?.miscQuantity ?? 0;

  // ==================== Torso Bag Fetching ====================

  // For regular bundles: fetch base bags. For custom: fetch bags matching the bundle size.
  const torsoBagQueryParam = useMemo(() => {
    if (!selectedBundle) return {};
    return {
      targetBundleSize: isCustomBundle
        ? selectedBundle.minifigQuantity
        : baseBundleSize,
    };
  }, [selectedBundle, isCustomBundle, baseBundleSize]);

  const {
    data: torsoBagData,
    isLoading: isLoadingTorsoBags,
    isError: isErrorTorsoBags,
  } = useGetDealerTorsoBagsQuery(torsoBagQueryParam, {
    skip: !selectedBundle,
  });

  const torsoBags = Array.isArray(torsoBagData?.torsoBags)
    ? torsoBagData.torsoBags
    : [];

  // ==================== Computed Selections ====================

  const bundlesWithSelection = useMemo(() => {
    return bundles.map((bundle) => ({
      ...bundle,
      isSelected: selectedBundleId === bundle._id,
    }));
  }, [bundles, selectedBundleId]);

  const addonsWithSelection = useMemo(() => {
    return addons.map((addon) => ({
      ...addon,
      isSelected: selectedAddonId === addon._id,
      hasItems: addon.items?.length > 0,
    }));
  }, [addons, selectedAddonId]);

  const maxExtraBags = useMemo(() => {
    if (!selectedBundle) return 0;
    return Math.floor(selectedBundle.minifigQuantity / 100);
  }, [selectedBundle]);

  const totalExtraBags = useMemo(() => {
    return Object.values(extraBagQuantities).reduce((acc, qty) => acc + qty, 0);
  }, [extraBagQuantities]);

  const extraBagsWithComputed = useMemo(() => {
    return extraBags.map((bag) => {
      const qty = extraBagQuantities[bag._id] || 0;
      return {
        ...bag,
        qty,
        canIncrease: totalExtraBags < maxExtraBags,
        canDecrease: qty > 0,
      };
    });
  }, [extraBags, extraBagQuantities, totalExtraBags, maxExtraBags]);

  // Add isSelected + firstImage + scaled items for display
  const torsoBagsWithSelection = useMemo(() => {
    return torsoBags.map((bag) => ({
      ...bag,
      isSelected: selectedTorsoBagIds.includes(bag._id),
      firstImage: bag.items?.[0]?.image?.url,
    }));
  }, [torsoBags, selectedTorsoBagIds]);

  // ==================== Effects ====================

  // Reset selections when bundle changes
  useEffect(() => {
    if (totalExtraBags > maxExtraBags) {
      setExtraBagQuantities({});
    }
  }, [maxExtraBags, totalExtraBags]);

  // Clear torso bag selection when bundle changes (bags might differ)
  useEffect(() => {
    setSelectedTorsoBagIds([]);
  }, [selectedBundleId]);

  // ==================== Handlers ====================

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

  // Build display items (apply multiplier for regular bundles)
  const displayItems = useMemo(() => {
    if (!lastSelectedBag?.items) return [];
    return lastSelectedBag.items.map((item) => ({
      ...item,
      displayQuantity: isCustomBundle
        ? item.quantity
        : item.quantity * multiplier,
    }));
  }, [lastSelectedBag, isCustomBundle, multiplier]);

  // ==================== Reorder Logic ====================

  useEffect(() => {
    if (lastSelectedBag?.items) {
      setLocalItems(lastSelectedBag.items);
      setHasReorderChanges(false);
    }
  }, [lastSelectedBag]);

  const reorderSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleReorderDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && lastSelectedBag) {
      const oldIndex = parseInt(active.id);
      const newIndex = parseInt(over.id);
      setLocalItems((prev) => arrayMove(prev, oldIndex, newIndex));
      setHasReorderChanges(true);
    }
  };

  const handleSaveReorder = async () => {
    if (!lastSelectedBag || !hasReorderChanges) return;
    setIsSavingOrder(true);
    try {
      const reorderIndices = localItems.map((newItem) =>
        lastSelectedBag.items.findIndex(
          (origItem) => origItem.image?.url === newItem.image?.url,
        ),
      );
      await reorderTorsoBagItems({
        id: lastSelectedBag._id,
        itemOrder: reorderIndices,
      }).unwrap();
      setHasReorderChanges(false);
    } catch (error) {
      console.error("Failed to save order:", error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleResetReorder = () => {
    if (lastSelectedBag?.items) {
      setLocalItems(lastSelectedBag.items);
      setHasReorderChanges(false);
    }
  };

  const reorderItemIds = useMemo(
    () => localItems.map((_, idx) => idx.toString()),
    [localItems],
  );

  // ==================== Pricing ====================

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
      extraBagsCost
    );
  }, [selectedBundle, selectedAddonData, extraBagsCost]);

  // ==================== Status ====================

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
    setSelectedBundleId,
    setSelectedAddonId,
    selectedAddon,
    setSelectedAddon,
    extraBagQuantities,
    selectedTorsoBagIds,

    // Data
    bundles: bundlesWithSelection,
    addons: addonsWithSelection,
    extraBags: extraBagsWithComputed,
    torsoBags: torsoBagsWithSelection,

    // Bundle Type Info
    isCustomBundle,
    multiplier,
    baseBundleSize,
    miscQuantity,
    displayItems,

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
  };
};
