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
  const { data, isLoading, isFetching } = useGetRewardBundlesQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const {
    items: bundles,
    totalItems,
    totalPages,
  } = extractPaginatedData(data, "bundles");

  const columns = [
    { label: "Bundle", key: "bundleName" },
    { label: "Quantity", key: "minifigQuantity" },
    { label: "Total Price", key: "totalPrice" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
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
    search: crud.search,
    limit: crud.limit,
    page: crud.page,
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    dialogMode: crud.dialogMode,
    selectedBundle: crud.selectedItem,
    formData: crud.formData,
    bundles,
    totalItems,
    totalPages,
    columns,
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
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
