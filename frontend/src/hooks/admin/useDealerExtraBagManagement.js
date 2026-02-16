import {
  useGetDealerExtraBagsQuery,
  useCreateDealerExtraBagMutation,
  useUpdateDealerExtraBagMutation,
  useDeleteDealerExtraBagMutation,
  useGetSubCollectionsQuery,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  subCollectionId: "",
  price: "",
  isActive: true,
};

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

  const columns = [
    { key: "subCollectionId", label: "Part Type" },
    { key: "price", label: "Price Per Bag" },
    { key: "isActive", label: "Status" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleEdit = (bag) => {
    crud.openEdit(bag, {
      subCollectionId: bag.subCollectionId?._id || "",
      price: bag.price,
      isActive: bag.isActive,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await crud.submitForm({
      subCollectionId: (crud.formData.subCollectionId ?? "").trim(),
      price: crud.formData.price ? Number(crud.formData.price) : undefined,
      isActive: crud.formData.isActive,
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedBag: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    subCollections,
    extraBags,
    totalItems,
    totalPages,
    columns,
    isLoadingExtraBags,
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

export default useDealerExtraBagManagement;
