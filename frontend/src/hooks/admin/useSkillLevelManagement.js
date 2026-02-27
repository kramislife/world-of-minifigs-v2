import { useEffect } from "react";
import {
  useCreateSkillLevelMutation,
  useUpdateSkillLevelMutation,
  useGetSkillLevelsQuery,
  useDeleteSkillLevelMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { sanitizeString } from "@/utils/formatting";
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
  // ------------------------------- Mutations ------------------------------------
  const [createSkillLevel, { isLoading: isCreating }] =
    useCreateSkillLevelMutation();
  const [updateSkillLevel, { isLoading: isUpdating }] =
    useUpdateSkillLevelMutation();
  const [deleteSkillLevel, { isLoading: isDeleting }] =
    useDeleteSkillLevelMutation();

  // ------------------------------- Core CRUD ------------------------------------
  const crud = useAdminCrud({
    initialFormData,
    createFn: createSkillLevel,
    updateFn: updateSkillLevel,
    deleteFn: deleteSkillLevel,
    entityName: "skill level",
  });

  // ------------------------------- Fetch ------------------------------------
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

  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems]);

  // ------------------------------- Submit Mode ------------------------------------
  const isSubmitting = crud.isEditMode ? isUpdating : isCreating;

  // ------------------------------- Edit Handler ------------------------------------
  const handleEdit = (skillLevel) => {
    crud.openEdit(skillLevel, {
      skillLevelName: skillLevel.skillLevelName || "",
      description: skillLevel.description || "",
      isActive: skillLevel.isActive !== false,
    });
  };

  // ------------------------------- Submit Handler ------------------------------------
  const handleSubmit = async () => {
    if (!validateSkillLevel(crud.formData)) return;

    const payload = {
      skillLevelName: sanitizeString(crud.formData.skillLevelName),
      description: sanitizeString(crud.formData.description),
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
    skillLevels,
    totalItems,
    totalPages,
    columns,
    isLoadingSkillLevels,
    isSubmitting,
    isDeleting,
    handleEdit,
    handleSubmit,
    handleChange,
    handleValueChange,
  };
};

export default useSkillLevelManagement;
