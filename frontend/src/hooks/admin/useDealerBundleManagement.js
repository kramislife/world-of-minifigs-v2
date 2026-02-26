import { useEffect } from "react";
import {
  useGetDealerBundlesQuery,
  useCreateDealerBundleMutation,
  useUpdateDealerBundleMutation,
  useDeleteDealerBundleMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import {
  formatCurrency,
  cleanFeatures,
  sanitizeString,
} from "@/utils/formatting";
import { validateDealerBundle } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  bundleName: "",
  minifigQuantity: "",
  unitPrice: "",
  torsoBagType: "regular",
  isActive: true,
  features: [""],
};

const columns = [
  { key: "bundleName", label: "Bundle" },
  { key: "minifigQuantity", label: "Quantity" },
  { key: "torsoBagType", label: "Torso Type" },
  { key: "unitPrice", label: "Unit Price" },
  { key: "totalPrice", label: "Total Price" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useDealerBundleManagement = () => {
  const [createBundle, { isLoading: isCreating }] =
    useCreateDealerBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] =
    useUpdateDealerBundleMutation();
  const [deleteBundle, { isLoading: isDeleting }] =
    useDeleteDealerBundleMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createBundle,
    updateFn: updateBundle,
    deleteFn: deleteBundle,
    entityName: "bundle",
  });

  // Fetch data
  const { data: bundlesResponse, isLoading: isLoadingBundles } =
    useGetDealerBundlesQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: bundles,
    totalItems,
    totalPages,
  } = extractPaginatedData(bundlesResponse, "bundles");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  // Derived State
  const calculatedTotal = formatCurrency(
    Number(crud.formData.minifigQuantity || 0) *
      Number(crud.formData.unitPrice || 0),
  );

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (bundle) => {
    crud.openEdit(bundle, {
      bundleName: bundle.bundleName,
      minifigQuantity: bundle.minifigQuantity,
      unitPrice: bundle.unitPrice,
      torsoBagType: bundle.torsoBagType || "regular",
      isActive: bundle.isActive,
      features: bundle.features?.length > 0 ? bundle.features : [""],
    });
  };

  const handleSubmit = async () => {
    if (!validateDealerBundle(crud.formData)) return;

    const payload = {
      bundleName: sanitizeString(crud.formData.bundleName),
      minifigQuantity: Number(crud.formData.minifigQuantity),
      totalPrice: Number(calculatedTotal),
      torsoBagType: crud.formData.torsoBagType || "regular",
      isActive: crud.formData.isActive,
      features: cleanFeatures(crud.formData.features),
    };

    await crud.submitForm(payload);
  };

  return {
    ...crud,
    selectedBundle: crud.selectedItem,
    bundles,
    totalItems,
    totalPages,
    calculatedTotal,
    columns,
    isLoadingBundles,
    isSubmitting,
    isDeleting,

    // Handlers
    handleEdit,
    handleSubmit,
  };
};

export default useDealerBundleManagement;
