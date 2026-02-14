import { toast } from "sonner";
import {
  useGetDealerBundlesQuery,
  useCreateDealerBundleMutation,
  useUpdateDealerBundleMutation,
  useDeleteDealerBundleMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  bundleName: "",
  minifigQuantity: "",
  unitPrice: "",
  isActive: true,
  features: [""],
};

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
  const { data, isLoading, isFetching } = useGetDealerBundlesQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const {
    items: bundles,
    totalItems,
    totalPages,
  } = extractPaginatedData(data, "bundles");

  // Derived State
  const calculatedTotal = (
    Number(crud.formData.minifigQuantity || 0) *
    Number(crud.formData.unitPrice || 0)
  ).toFixed(2);

  const columns = [
    { label: "Bundle", key: "bundleName" },
    { label: "Quantity", key: "minifigQuantity" },
    { label: "Unit Price", key: "unitPrice" },
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
      unitPrice: bundle.unitPrice,
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
    if (crud.formData.unitPrice === "" || Number(crud.formData.unitPrice) < 0) {
      toast.error("Valid unit price is required");
      return;
    }

    const cleanFeatures = crud.formData.features
      .map((f) => f.trim())
      .filter((f) => f !== "");

    await crud.submitForm({
      ...crud.formData,
      minifigQuantity: Number(crud.formData.minifigQuantity),
      unitPrice: Number(crud.formData.unitPrice),
      totalPrice: Number(calculatedTotal),
      features: cleanFeatures,
    });
  };

  return {
    // State
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
    calculatedTotal,
    columns,
    isLoading: isLoading || isFetching,
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

export default useDealerBundleManagement;
