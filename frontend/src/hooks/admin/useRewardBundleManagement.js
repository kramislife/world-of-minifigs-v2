import { useEffect } from "react";
import {
  useGetRewardBundlesQuery,
  useCreateRewardBundleMutation,
  useUpdateRewardBundleMutation,
  useDeleteRewardBundleMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { cleanFeatures, sanitizeString } from "@/utils/formatting";
import { validateRewardBundle } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  bundleName: "",
  minifigQuantity: "",
  totalPrice: "",
  isActive: true,
  features: [""],
};

const columns = [
  { key: "bundleName", label: "Bundle" },
  { key: "minifigQuantity", label: "Quantity" },
  { key: "totalPrice", label: "Total Price" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useRewardBundleManagement = () => {
  const [createBundle, { isLoading: isCreating }] =
    useCreateRewardBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] =
    useUpdateRewardBundleMutation();
  const [deleteBundle, { isLoading: isDeleting }] =
    useDeleteRewardBundleMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createBundle,
    updateFn: updateBundle,
    deleteFn: deleteBundle,
    entityName: "reward bundle",
  });

  // Fetch data
  const { data: bundlesResponse, isLoading: isLoadingBundles } =
    useGetRewardBundlesQuery({
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

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (bundle) => {
    crud.openEdit(bundle, {
      bundleName: bundle.bundleName,
      minifigQuantity: bundle.minifigQuantity,
      totalPrice: bundle.totalPrice ?? "",
      isActive: bundle.isActive,
      features: bundle.features?.length > 0 ? bundle.features : [""],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRewardBundle(crud.formData)) return;

    await crud.submitForm({
      bundleName: sanitizeString(crud.formData.bundleName),
      minifigQuantity: Number(crud.formData.minifigQuantity),
      totalPrice: Number(crud.formData.totalPrice),
      features: cleanFeatures(crud.formData.features),
      isActive: crud.formData.isActive,
    });
  };

  return {
    ...crud,
    selectedBundle: crud.selectedItem,
    bundles,
    totalItems,
    totalPages,
    columns,
    isLoadingBundles,
    isSubmitting,
    isDeleting,

    // Handlers
    handleEdit,
    handleSubmit,
  };
};

export default useRewardBundleManagement;
