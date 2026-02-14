import { useState, useCallback } from "react";
import { handleApiError, handleApiSuccess } from "@/utils/apiHelpers";

const useAdminCrud = ({
  initialFormData,
  createFn,
  updateFn,
  deleteFn,
  entityName = "item",
  onReset,
}) => {
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");
  const [page, setPage] = useState(1);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedItem(null);
    setDialogMode("add");
    onReset?.();
  }, [initialFormData, onReset]);

  // Dialog Handlers
  const handleDialogClose = useCallback(
    (open) => {
      setDialogOpen(open);
      if (!open) resetForm();
    },
    [resetForm],
  );

  const handleAdd = useCallback(
    (overrides) => {
      resetForm();
      if (overrides) {
        setFormData((prev) => ({ ...prev, ...overrides }));
      }
      setDialogOpen(true);
    },
    [resetForm],
  );

  const openEdit = useCallback((item, mappedFormData) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setFormData(mappedFormData);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  }, []);

  // CRUD: Submit (create or update)
  const submitForm = useCallback(
    async (payload) => {
      try {
        if (dialogMode === "add") {
          const response = await createFn(payload).unwrap();
          if (response.success) {
            handleApiSuccess(response, `${entityName} created successfully`);
            handleDialogClose(false);
          }
          return response;
        } else {
          const id = selectedItem?._id || selectedItem?.id;
          const response = await updateFn({ id, ...payload }).unwrap();
          if (response.success) {
            handleApiSuccess(response, `${entityName} updated successfully`);
            handleDialogClose(false);
          }
          return response;
        }
      } catch (error) {
        handleApiError(error, `Failed to save ${entityName}`);
        throw error;
      }
    },
    [
      dialogMode,
      selectedItem,
      createFn,
      updateFn,
      entityName,
      handleDialogClose,
    ],
  );

  // CRUD: Delete
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedItem) return;
    try {
      const id = selectedItem._id || selectedItem.id;
      const response = await deleteFn(id).unwrap();
      if (response.success) {
        handleApiSuccess(response, `${entityName} deleted successfully`);
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      handleApiError(error, `Failed to delete ${entityName}`);
    }
  }, [selectedItem, deleteFn, entityName]);

  // Pagination Handlers
  const handlePageChange = useCallback((p) => setPage(p), []);
  const handleLimitChange = useCallback((l) => {
    setLimit(l);
    setPage(1);
  }, []);
  const handleSearchChange = useCallback((s) => {
    setSearch(s);
    setPage(1);
  }, []);

  return {
    // Dialog State
    dialogOpen,
    deleteDialogOpen,
    dialogMode,
    selectedItem,
    formData,
    setFormData,
    setDeleteDialogOpen,

    // Pagination State
    search,
    limit,
    page,

    // Dialog Handlers
    handleDialogClose,
    handleAdd,
    openEdit,
    handleDelete,

    // CRUD Handlers
    submitForm,
    handleConfirmDelete,

    // Pagination Handlers
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
  };
};

export default useAdminCrud;
