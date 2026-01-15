import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateSkillLevelMutation,
  useUpdateSkillLevelMutation,
  useGetSkillLevelsQuery,
  useDeleteSkillLevelMutation,
} from "@/redux/api/adminApi";

const useSkillLevelManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(null);
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState({
    skillLevelName: "",
    description: "",
  });

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: skillLevelsResponse, isLoading: isLoadingSkillLevels } =
    useGetSkillLevelsQuery({
      page,
      limit,
      search: search || undefined,
    });

  const [createSkillLevel, { isLoading: isCreating }] =
    useCreateSkillLevelMutation();
  const [updateSkillLevel, { isLoading: isUpdating }] =
    useUpdateSkillLevelMutation();
  const [deleteSkillLevel, { isLoading: isDeleting }] =
    useDeleteSkillLevelMutation();

  // Extract data from server response
  const skillLevels = skillLevelsResponse?.skillLevels || [];
  const totalItems = skillLevelsResponse?.pagination?.totalItems || 0;
  const totalPages = skillLevelsResponse?.pagination?.totalPages || 1;

  // Column definitions
  const columns = [
    { key: "skillLevelName", label: "Skill Level" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "actions", label: "Actions" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.skillLevelName.trim()) {
      toast.error("Skill level is required", {
        description: "Please enter a skill level.",
      });
      return;
    }

    try {
      const skillLevelData = {
        skillLevelName: formData.skillLevelName.trim(),
        description: formData.description.trim(),
      };

      if (dialogMode === "edit" && selectedSkillLevel) {
        const skillLevelId = selectedSkillLevel._id || selectedSkillLevel.id;
        const response = await updateSkillLevel({
          id: skillLevelId,
          ...skillLevelData,
        }).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Skill level updated successfully",
            {
              description:
                response.description ||
                `The skill level "${response.skillLevel.skillLevelName}" has been updated.`,
            }
          );

          setFormData({
            skillLevelName: "",
            description: "",
          });
          setSelectedSkillLevel(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        const response = await createSkillLevel(skillLevelData).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Skill level created successfully",
            {
              description:
                response.description ||
                `The skill level "${response.skillLevel.skillLevelName}" has been added.`,
            }
          );

          setFormData({
            skillLevelName: "",
            description: "",
          });
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(
        `${dialogMode === "edit" ? "Update" : "Create"} skill level error:`,
        error
      );
      toast.error(
        error?.data?.message ||
          `Failed to ${
            dialogMode === "edit" ? "update" : "create"
          } skill level`,
        {
          description:
            error?.data?.description ||
            "An unexpected error occurred. Please try again.",
        }
      );
    }
  };

  const handleDialogClose = (open) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
        skillLevelName: "",
        description: "",
      });
      setSelectedSkillLevel(null);
      setDialogMode("add");
    }
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedSkillLevel(null);
    setFormData({
      skillLevelName: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (skillLevel) => {
    setDialogMode("edit");
    setSelectedSkillLevel(skillLevel);
    setFormData({
      skillLevelName: skillLevel.skillLevelName || "",
      description: skillLevel.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (skillLevel) => {
    setSelectedSkillLevel(skillLevel);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSkillLevel) return;

    try {
      const skillLevelId = selectedSkillLevel._id || selectedSkillLevel.id;
      const response = await deleteSkillLevel(skillLevelId).unwrap();

      if (response.success) {
        toast.success(response.message || "Skill level deleted successfully", {
          description:
            response.description ||
            `The skill level "${selectedSkillLevel.skillLevelName}" has been removed.`,
        });

        setDeleteDialogOpen(false);
        setSelectedSkillLevel(null);
      }
    } catch (error) {
      console.error("Delete skill level error:", error);
      toast.error(error?.data?.message || "Failed to delete skill level", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return {
    // State
    dialogOpen,
    deleteDialogOpen,
    selectedSkillLevel,
    dialogMode,
    formData,
    page,
    limit,
    search,
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
    handleDialogClose,
    handleAdd,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    setDeleteDialogOpen,
  };
};

export default useSkillLevelManagement;
