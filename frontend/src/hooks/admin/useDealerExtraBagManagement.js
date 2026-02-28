import { useEffect } from "react";
import {
  useGetDealerExtraBagsQuery,
  useCreateDealerExtraBagMutation,
  useUpdateDealerExtraBagMutation,
  useDeleteDealerExtraBagMutation,
  useGetSubCollectionsQuery,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
import { validateDealerExtraBag } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  subCollectionId: "",
  price: "",
  isActive: true,
};

const columns = [
  { key: "subCollectionId", label: "Part Type" },
  { key: "price", label: "Price Per Bag" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const useDealerExtraBagManagement = () => {
  // ------------------------------- Mutations ------------------------------------
  const [createExtraBag, { isLoading: isCreating }] =
    useCreateDealerExtraBagMutation();
  const [updateExtraBag, { isLoading: isUpdating }] =
    useUpdateDealerExtraBagMutation();
  const [deleteExtraBag, { isLoading: isDeleting }] =
    useDeleteDealerExtraBagMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createExtraBag,
    updateFn: updateExtraBag,
    deleteFn: deleteExtraBag,
    entityName: "bag pricing",
  });

  // ------------------------------- Fetch ------------------------------------
  const { data: extraBagsData, isLoading: isLoadingExtraBags } =
    useGetDealerExtraBagsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: subCollectionsData, isLoading: isLoadingSubCollections } =
    useGetSubCollectionsQuery({
      limit: 1000,
    });

  const {
    items: extraBags,
    totalItems,
    totalPages,
  } = extractPaginatedData(extraBagsData, "extraBags");

  const subCollections = [...(subCollectionsData?.subCollections || [])].sort(
    (a, b) =>
      (a.subCollectionName || "").localeCompare(b.subCollectionName || ""),
  );

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (bag) => {
    crud.openEdit(bag, {
      subCollectionId: bag.subCollectionId?._id || "",
      price: bag.price || "",
      isActive: bag.isActive !== false,
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateDealerExtraBag(crud.formData)) return;

    const payload = {
      subCollectionId: sanitizeString(crud.formData.subCollectionId),
      price: Number(crud.formData.price || 0),
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

  // ------------------------------- Return ------------------------------------
  return {
    ...crud,
    subCollections,
    extraBags,
    totalItems,
    totalPages,
    columns,
    isLoadingExtraBags,
    isLoadingSubCollections,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useDealerExtraBagManagement;
