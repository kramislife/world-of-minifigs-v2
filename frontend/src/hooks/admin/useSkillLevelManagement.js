import { useEffect } from "react";
import {
  useCreateSkillLevelMutation,
  useUpdateSkillLevelMutation,
  useGetSkillLevelsQuery,
  useDeleteSkillLevelMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizePayload } from "@/utils/formatting";
import { validateSkillLevel } from "@/utils/validation";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const initialFormData = {
  skillLevelName: "",
  description: "",
  isActive: true,
};

const columns = [
  { key: "skillLevelName", label: "Skill Level" },
  { key: "description", label: "Description" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

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

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

  const isSubmitting = crud.dialogMode === "edit" ? isUpdating : isCreating;

  const handleEdit = (skillLevel) => {
    crud.openEdit(skillLevel, {
      skillLevelName: skillLevel.skillLevelName || "",
      description: skillLevel.description || "",
      isActive: skillLevel.isActive !== false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSkillLevel(crud.formData)) return;

    await crud.submitForm({
      ...sanitizePayload(crud.formData, ["skillLevelName", "description"]),
      isActive: crud.formData.isActive,
    });
  };

  return {
    ...crud,
    selectedSkillLevel: crud.selectedItem,
    skillLevels,
    totalItems,
    totalPages,
    columns,
    isLoadingSkillLevels,
    isSubmitting,
    isDeleting,

    // Handlers
    handleSubmit,
    handleEdit,
  };
};

export default useSkillLevelManagement;
