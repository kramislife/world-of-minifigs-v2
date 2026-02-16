import { toast } from "sonner";
import {
  useGetRewardBundlesQuery,
  useCreateRewardBundleMutation,
  useUpdateRewardBundleMutation,
  useDeleteRewardBundleMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  bundleName: "",
  minifigQuantity: "",
  totalPrice: "",
  isActive: true,
  features: [""],
};

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

  const columns = [
    { key: "bundleName", label: "Bundle" },
    { key: "minifigQuantity", label: "Quantity" },
    { key: "totalPrice", label: "Total Price" },
    { key: "isActive", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

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

    if (!crud.formData.bundleName.trim()) {
      toast.error("Bundle name is required");
      return;
    }
    if (
      !crud.formData.minifigQuantity ||
      Number(crud.formData.minifigQuantity) <= 0
    ) {
      toast.error("Valid quantity is required");
      return;
    }
    if (
      crud.formData.totalPrice === "" ||
      Number(crud.formData.totalPrice) < 0
    ) {
      toast.error("Valid total price is required");
      return;
    }

    const cleanFeatures = crud.formData.features
      .map((f) => f.trim())
      .filter((f) => f !== "");

    await crud.submitForm({
      bundleName: crud.formData.bundleName.trim(),
      minifigQuantity: Number(crud.formData.minifigQuantity),
      totalPrice: Number(crud.formData.totalPrice),
      features: cleanFeatures,
      isActive: crud.formData.isActive,
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedBundle: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    bundles,
    totalItems,
    totalPages,
    columns,
    isLoadingBundles,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleDialogClose: crud.handleDialogClose,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
    setFormData: crud.setFormData,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleSubmit,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
  };
};

export default useRewardBundleManagement;
