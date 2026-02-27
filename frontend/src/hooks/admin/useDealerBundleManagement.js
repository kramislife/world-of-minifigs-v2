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
  // ------------------------------- Mutations ------------------------------------
  const [createBundle, { isLoading: isCreating }] =
    useCreateDealerBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] =
    useUpdateDealerBundleMutation();
  const [deleteBundle, { isLoading: isDeleting }] =
    useDeleteDealerBundleMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createBundle,
    updateFn: updateBundle,
    deleteFn: deleteBundle,
    entityName: "bundle",
  });

  // ------------------------------- Fetch ------------------------------------
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

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  // ------------------------------- Derived State ------------------------------------
  const calculatedTotal = formatCurrency(
    Number(crud.formData.minifigQuantity || 0) *
      Number(crud.formData.unitPrice || 0),
  );

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (bundle) => {
    crud.openEdit(bundle, {
      bundleName: bundle.bundleName || "",
      minifigQuantity: bundle.minifigQuantity || "",
      unitPrice: bundle.unitPrice || "",
      torsoBagType: bundle.torsoBagType || "regular",
      isActive: bundle.isActive !== false,
      features:
        bundle.features && bundle.features.length > 0 ? bundle.features : [""],
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateDealerBundle(crud.formData)) return;

    const payload = {
      bundleName: sanitizeString(crud.formData.bundleName),
      minifigQuantity: Number(crud.formData.minifigQuantity),
      unitPrice: Number(crud.formData.unitPrice),
      totalPrice: Number(calculatedTotal),
      torsoBagType: crud.formData.torsoBagType || "regular",
      isActive: crud.formData.isActive,
      features: cleanFeatures(crud.formData.features),
    };

    await crud.submitForm(payload);
  };

  // ------------------------------- Handlers ------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    crud.setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleValueChange = (field) => (value) => {
    crud.setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayName, index) => (e) => {
    const value = e?.target ? e.target.value : e;
    crud.setFormData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem =
    (arrayName, defaultValue = "") =>
    () => {
      crud.setFormData((prev) => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] || []), defaultValue],
      }));
    };

  const removeArrayItem = (arrayName, index) => () => {
    crud.setFormData((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).filter((_, i) => i !== index),
    }));
  };

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    bundles,
    totalItems,
    totalPages,
    calculatedTotal,
    columns,
    isLoadingBundles,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
  };
};

export default useDealerBundleManagement;
