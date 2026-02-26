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
  const [createExtraBag, { isLoading: isCreating }] =
    useCreateDealerExtraBagMutation();
  const [updateExtraBag, { isLoading: isUpdating }] =
    useUpdateDealerExtraBagMutation();
  const [deleteExtraBag, { isLoading: isDeleting }] =
    useDeleteDealerExtraBagMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createExtraBag,
    updateFn: updateExtraBag,
    deleteFn: deleteExtraBag,
    entityName: "bag pricing",
  });

  // Fetch data
  const { data: extraBagsResponse, isLoading: isLoadingExtraBags } =
    useGetDealerExtraBagsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const { data: subCollectionsData } = useGetSubCollectionsQuery({
    limit: 1000,
  });
  const subCollections = subCollectionsData?.subCollections || [];

  const {
    items: extraBags,
    totalItems,
    totalPages,
  } = extractPaginatedData(extraBagsResponse, "extraBags");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (bag) => {
    crud.openEdit(bag, {
      subCollectionId: bag.subCollectionId?._id || "",
      price: bag.price,
      isActive: bag.isActive,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDealerExtraBag(crud.formData)) return;

    await crud.submitForm({
      subCollectionId: sanitizeString(crud.formData.subCollectionId),
      price: crud.formData.price ? Number(crud.formData.price) : undefined,
      isActive: crud.formData.isActive,
    });
  };

  return {
    ...crud,
    selectedBag: crud.selectedItem,
    subCollections,
    extraBags,
    totalItems,
    totalPages,
    columns,
    isLoadingExtraBags,
    isSubmitting,
    isDeleting,

    // Handlers
    handleEdit,
    handleSubmit,
  };
};

export default useDealerExtraBagManagement;
