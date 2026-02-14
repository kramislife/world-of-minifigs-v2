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
  const { data, isLoading, isFetching } = useGetDealerExtraBagsQuery({
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
  } = extractPaginatedData(data, "extraBags");

  const columns = [
    { label: "Part Type", key: "subCollectionId" },
    { label: "Price Per Bag", key: "price" },
    { label: "Status", key: "isActive" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
    { label: "Actions", key: "actions" },
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
    await crud.submitForm(crud.formData);
  };

  return {
    // State
    search: crud.search,
    limit: crud.limit,
    page: crud.page,
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    dialogMode: crud.dialogMode,
    selectedBag: crud.selectedItem,
    formData: crud.formData,
    subCollections,
    extraBags,
    totalItems,
    totalPages,
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

export default useDealerExtraBagManagement;
