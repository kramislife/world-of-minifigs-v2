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
  // ------------------------------- Mutations ------------------------------------
  const [createBundle, { isLoading: isCreating }] =
    useCreateRewardBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] =
    useUpdateRewardBundleMutation();
  const [deleteBundle, { isLoading: isDeleting }] =
    useDeleteRewardBundleMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createBundle,
    updateFn: updateBundle,
    deleteFn: deleteBundle,
    entityName: "reward bundle",
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: bundlesData, isLoading: isLoadingBundles } =
    useGetRewardBundlesQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: bundles,
    totalItems,
    totalPages,
  } = extractPaginatedData(bundlesData, "bundles");

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (bundle) => {
    crud.openEdit(bundle, {
      bundleName: bundle.bundleName || "",
      minifigQuantity: bundle.minifigQuantity || "",
      totalPrice: bundle.totalPrice ?? "",
      isActive: bundle.isActive !== false,
      features: bundle.features?.length ? bundle.features : [""],
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateRewardBundle(crud.formData)) return;

    const payload = {
      bundleName: sanitizeString(crud.formData.bundleName),
      minifigQuantity: Number(crud.formData.minifigQuantity),
      totalPrice: Number(crud.formData.totalPrice),
      features: cleanFeatures(crud.formData.features),
      isActive: crud.formData.isActive,
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

export default useRewardBundleManagement;
