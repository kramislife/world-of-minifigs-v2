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
  torsoBagType: "regular",
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

  // Derived State
  const calculatedTotal = (
    Number(crud.formData.minifigQuantity || 0) *
    Number(crud.formData.unitPrice || 0)
  ).toFixed(2);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.bundleName?.trim()) {
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

    const cleanFeatures = (crud.formData.features || [])
      .map((f) => String(f).trim())
      .filter((f) => f !== "");

    await crud.submitForm({
      bundleName: crud.formData.bundleName.trim(),
      minifigQuantity: Number(crud.formData.minifigQuantity),
      totalPrice: Number(calculatedTotal),
      torsoBagType: crud.formData.torsoBagType || "regular",
      isActive: crud.formData.isActive,
      features: cleanFeatures,
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
    calculatedTotal,
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

export default useDealerBundleManagement;
