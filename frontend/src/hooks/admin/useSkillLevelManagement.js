import { toast } from "sonner";
import {
  useCreateSkillLevelMutation,
  useUpdateSkillLevelMutation,
  useGetSkillLevelsQuery,
  useDeleteSkillLevelMutation,
} from "@/redux/api/adminApi";
import useAdminCrud from "@/hooks/admin/useAdminCrud";
import { extractPaginatedData } from "@/utils/apiHelpers";

const initialFormData = {
  skillLevelName: "",
  description: "",
};

const useSkillLevelManagement = () => {
  const [createSkillLevel, { isLoading: isCreating }] =
    useCreateSkillLevelMutation();
  const [updateSkillLevel, { isLoading: isUpdating }] =
    useUpdateSkillLevelMutation();
  const [deleteSkillLevel, { isLoading: isDeleting }] =
    useDeleteSkillLevelMutation();

  const crud = useAdminCrud({
    initialFormData,
    createFn: createSkillLevel,
    updateFn: updateSkillLevel,
    deleteFn: deleteSkillLevel,
    entityName: "skill level",
  });

  // Fetch data
  const { data: skillLevelsResponse, isLoading: isLoadingSkillLevels } =
    useGetSkillLevelsQuery({
      page: crud.page,
      limit: crud.limit,
      search: crud.search || undefined,
    });

  const {
    items: skillLevels,
    totalItems,
    totalPages,
  } = extractPaginatedData(skillLevelsResponse, "skillLevels");

  const columns = [
    { key: "skillLevelName", label: "Skill Level" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    crud.setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (skillLevel) => {
    crud.openEdit(skillLevel, {
      skillLevelName: skillLevel.skillLevelName || "",
      description: skillLevel.description || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!crud.formData.skillLevelName.trim()) {
      toast.error("Skill level is required", {
        description: "Please enter a skill level.",
      });
      return;
    }

    await crud.submitForm({
      skillLevelName: crud.formData.skillLevelName.trim(),
      description: crud.formData.description.trim(),
    });
  };

  return {
    // State
    dialogOpen: crud.dialogOpen,
    deleteDialogOpen: crud.deleteDialogOpen,
    selectedSkillLevel: crud.selectedItem,
    dialogMode: crud.dialogMode,
    formData: crud.formData,
    page: crud.page,
    limit: crud.limit,
    search: crud.search,
    skillLevels,
    totalItems,
    totalPages,
    columns,
    isLoadingSkillLevels,
    isCreating,
    isUpdating,
    isDeleting,

    // Handlers
    handleChange,
    handleSubmit,
    handleDialogClose: crud.handleDialogClose,
    handleAdd: crud.handleAdd,
    handleEdit,
    handleDelete: crud.handleDelete,
    handleConfirmDelete: crud.handleConfirmDelete,
    handlePageChange: crud.handlePageChange,
    handleLimitChange: crud.handleLimitChange,
    handleSearchChange: crud.handleSearchChange,
    setDeleteDialogOpen: crud.setDeleteDialogOpen,
  };
};

export default useSkillLevelManagement;
