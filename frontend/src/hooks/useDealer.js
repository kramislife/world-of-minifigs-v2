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
import { sortByName } from "@/utils/formatting";
import { useReorderTorsoBagItemsMutation } from "@/redux/api/adminApi";

export const useDealer = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [selectedAddonConfigs, setSelectedAddonConfigs] = useState({});
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
      isSelected: selectedAddonIds.includes(addon._id),
      hasItems:
        addon.addonType === "bundle" && (addon.bundleItems?.length || 0) > 0,
    }));
  }, [addons, selectedAddonIds]);

  const maxExtraBags = selectedBundle
    ? Math.floor(selectedBundle.minifigQuantity / 100)
    : 0;

  const totalExtraBags = Object.values(extraBagQuantities).reduce(
    (acc, qty) => acc + qty,
    0,
  );

  const extraBagsWithComputed = useMemo(
    () =>
      extraBags.map((bag) => {
        const qty = extraBagQuantities[bag._id] || 0;
        const availableSlots = Math.max(0, maxExtraBags - totalExtraBags);
        return {
          ...bag,
          qty,
          total: (bag.price || 0) * qty,
          max: qty + availableSlots,
          canIncrease: totalExtraBags < maxExtraBags,
          canDecrease: qty > 0,
        };
      }),
    [extraBags, extraBagQuantities, totalExtraBags, maxExtraBags],
  );

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

  const handleExtraBagQtyChange = (bagId, newQty) => {
    setExtraBagQuantities((prev) => {
      const otherBagsQty = Object.entries(prev).reduce(
        (acc, [id, qty]) => (id === bagId ? acc : acc + qty),
        0,
      );
      if (otherBagsQty + newQty > maxExtraBags) return prev;
      return { ...prev, [bagId]: newQty };
    });
  };

  const handleToggleAddon = (addonId) => {
    setSelectedAddonIds((prev) => {
      if (prev.includes(addonId)) {
        setSelectedAddonConfigs((configs) => {
          const { [addonId]: _, ...rest } = configs;
          return rest;
        });
        return prev.filter((id) => id !== addonId);
      }
      return [...prev, addonId];
    });
  };

  const handleConfigureAddon = ({ addonId, price, selectedItems }) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev : [...prev, addonId],
    );
    setSelectedAddonConfigs((prev) => ({
      ...prev,
      [addonId]: { addonId, price, selectedItems },
    }));
  };

  // ==================== Addon Preview Modal ====================

  const modalItems = useMemo(() => {
    const items = selectedAddon?.bundleItems || [];
    return items
      .map((item, index) => {
        const inventory = item.inventoryItemId;
        if (!inventory?._id) return null;

        const perBagLimit = Number(item.quantityPerBag || 0);
        const stock = Number(inventory.stock || 0);
        const maxBags =
          perBagLimit > 0 ? Math.max(0, Math.floor(stock / perBagLimit)) : 0;

        return {
          key: `${inventory._id}-${index}`,
          inventoryItemId: inventory._id,
          itemName: inventory.minifigName,
          image: inventory.image,
          color: inventory.colorId,
          unitPrice: Number(inventory.price || 0),
          perBagLimit,
          maxBags,
        };
      })
      .filter(Boolean);
  }, [selectedAddon]);

  const [modalBagQuantities, setModalBagQuantities] = useState({});

  useEffect(() => {
    const config = selectedAddonConfigs[selectedAddon?._id];
    const savedItems =
      config?.addonId && config.addonId === selectedAddon?._id
        ? config.selectedItems
        : null;

    const quantities = modalItems.reduce((acc, item) => {
      const saved = savedItems?.find(
        (s) => s.inventoryItemId === item.inventoryItemId,
      );
      acc[item.inventoryItemId] = saved ? saved.selectedBags : 0;
      return acc;
    }, {});
    setModalBagQuantities(quantities);
  }, [modalItems, selectedAddon?._id, selectedAddonConfigs]);

  const handleModalBagDecrement = (inventoryItemId) => {
    setModalBagQuantities((prev) => ({
      ...prev,
      [inventoryItemId]: (prev[inventoryItemId] || 0) - 1,
    }));
  };

  const handleModalBagIncrement = (inventoryItemId) => {
    setModalBagQuantities((prev) => ({
      ...prev,
      [inventoryItemId]: (prev[inventoryItemId] || 0) + 1,
    }));
  };

  const handleModalBagValueChange = (inventoryItemId, value) => {
    setModalBagQuantities((prev) => ({
      ...prev,
      [inventoryItemId]: value,
    }));
  };

  const modalSelectedItems = useMemo(
    () =>
      sortByName(modalItems, "itemName").map((item) => {
        const bagQty = Number(modalBagQuantities[item.inventoryItemId] || 0);
        const selectedBags = Math.max(0, Math.min(bagQty, item.maxBags));
        const selectedQuantity = selectedBags * item.perBagLimit;
        const selectedTotal = selectedQuantity * item.unitPrice;
        const bagPrice = item.unitPrice * item.perBagLimit;
        const isActive = selectedBags > 0;
        const usedPercent =
          item.maxBags > 0 ? (selectedBags / item.maxBags) * 100 : 0;

        return {
          ...item,
          selectedBags,
          selectedQuantity,
          selectedTotal,
          bagPrice,
          isActive,
          usedPercent,
        };
      }),
    [modalItems, modalBagQuantities],
  );

  const modalTotalBags = modalSelectedItems.reduce(
    (sum, item) => sum + item.selectedBags,
    0,
  );

  const modalTotalPrice = modalSelectedItems.reduce(
    (sum, item) => sum + item.selectedTotal,
    0,
  );

  const modalCanSubmit = modalSelectedItems.some(
    (item) => item.selectedBags > 0,
  );

  const modalIsUpdate = selectedAddonIds.includes(selectedAddon?._id);

  const handleModalConfirm = () => {
    if (!selectedAddon) return;
    handleConfigureAddon({
      addonId: selectedAddon._id,
      price: modalTotalPrice,
      selectedItems: modalSelectedItems.filter((item) => item.selectedBags > 0),
    });
    setSelectedAddon(null);
  };

  const handleModalClose = () => setSelectedAddon(null);

  const handleSelectTorsoBag = (bagId) => {
    if (selectedTorsoBagIds.includes(bagId)) {
      setSelectedTorsoBagIds([]);
      return;
    }
    setSelectedTorsoBagIds([bagId]);
  };

  const lastSelectedBag =
    torsoBags.find((b) => b._id === selectedTorsoBagIds[0]) || null;

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

  // ==================== Order Summary ====================

  const selectedAddonsData = useMemo(
    () =>
      selectedAddonIds
        .map((id) => {
          const base = addons.find((a) => a._id === id);
          if (!base) return null;
          const config = selectedAddonConfigs[id];
          const price = config?.price ?? base.price ?? 0;
          return {
            _id: base._id,
            addonName: base.addonName,
            isFree: !price || Number(price) === 0,
            price,
            items: (config?.selectedItems || [])
              .filter((item) => (item.selectedQuantity || 0) > 0)
              .map((item) => ({
                inventoryItemId: item.inventoryItemId,
                itemName: item.itemName,
                selectedBags: item.selectedBags || 0,
                selectedTotal: item.selectedTotal || 0,
              })),
          };
        })
        .filter(Boolean),
    [addons, selectedAddonIds, selectedAddonConfigs],
  );

  const addonsTotalPrice = selectedAddonsData.reduce(
    (sum, addon) => sum + (addon.price || 0),
    0,
  );

  const extraBagsCost = extraBagsWithComputed.reduce(
    (sum, bag) => sum + bag.total,
    0,
  );

  const totalOrderPrice =
    (selectedBundle?.totalPrice || 0) + addonsTotalPrice + extraBagsCost;

  const summaryExtraBags = extraBagsWithComputed.filter((bag) => bag.qty > 0);

  const summaryTorsoBags = selectedTorsoBagIds
    .map((id) => {
      const bag = torsoBags.find((b) => b._id === id);
      return bag ? { _id: bag._id, bagName: bag.bagName } : null;
    })
    .filter(Boolean);

  const canCheckout = !!selectedBundle && selectedTorsoBagIds.length > 0;

  // ==================== Status ====================

  const isLoading =
    isLoadingBundles ||
    isLoadingAddons ||
    isLoadingExtraBags ||
    isLoadingTorsoBags;

  const isError =
    isErrorBundles || isErrorAddons || isErrorExtraBags || isErrorTorsoBags;

  return {
    // States & Setters
    setSelectedBundleId,

    // Data
    bundles: bundlesWithSelection,
    addons: addonsWithSelection,
    extraBags: extraBagsWithComputed,
    torsoBags: torsoBagsWithSelection,

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

    // Order Summary
    orderSummary: {
      addons: selectedAddonsData,
      extraBags: summaryExtraBags,
      torsoBags: summaryTorsoBags,
      totalExtraBags,
      totalOrderPrice,
      canCheckout,
    },

    // Handlers
    handleToggleAddon,
    handleExtraBagQtyChange,
    handleSelectTorsoBag,

    // Addon Preview Modal
    addonPreview: {
      addon: selectedAddon,
      items: modalSelectedItems,
      totalBags: modalTotalBags,
      totalPrice: modalTotalPrice,
      canSubmit: modalCanSubmit,
      isUpdate: modalIsUpdate,
      onOpen: setSelectedAddon,
      onClose: handleModalClose,
      onConfirm: handleModalConfirm,
      onDecrement: handleModalBagDecrement,
      onIncrement: handleModalBagIncrement,
      onValueChange: handleModalBagValueChange,
    },

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
  };
};
