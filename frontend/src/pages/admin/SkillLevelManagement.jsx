import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import {
  useCreateSkillLevelMutation,
  useUpdateSkillLevelMutation,
  useGetSkillLevelsQuery,
  useDeleteSkillLevelMutation,
} from "@/redux/api/adminApi";

const SkillLevelManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(null);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
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

  // Column definitions based on SkillLevel model
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

    // Validate form
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
        // Update existing skill level
        const skillLevelId = selectedSkillLevel._id || selectedSkillLevel.id;
        const response = await updateSkillLevel({
          id: skillLevelId,
          ...skillLevelData,
        }).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Skill level updated successfully",
            {
              description: `The skill level "${response.skillLevel.skillLevelName}" has been updated.`,
            }
          );

          // Reset form and close dialog
          setFormData({
            skillLevelName: "",
            description: "",
          });
          setSelectedSkillLevel(null);
          setDialogMode("add");
          setDialogOpen(false);
        }
      } else {
        // Create new skill level
        const response = await createSkillLevel(skillLevelData).unwrap();

        if (response.success) {
          toast.success(
            response.message || "Skill level created successfully",
            {
              description: `The skill level "${response.skillLevel.skillLevelName}" has been added.`,
            }
          );

          // Reset form and close dialog
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
      // Reset form and mode when dialog closes
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

      toast.success(response.message || "Skill level deleted successfully", {
        description: `The skill level "${selectedSkillLevel.skillLevelName}" has been removed.`,
      });

      setDeleteDialogOpen(false);
      setSelectedSkillLevel(null);
    } catch (error) {
      console.error("Delete skill level error:", error);
      toast.error(error?.data?.message || "Failed to delete skill level", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle pagination and search changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-5">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skill Level Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            Manage product skill levels in your store
          </p>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Skill Level
        </Button>
      </div>

      <TableLayout
        searchPlaceholder="Search skill levels..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        entriesValue={limit}
        onEntriesChange={handleLimitChange}
        page={page}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        totalPages={totalPages}
        columns={columns}
        data={skillLevels}
        isLoading={isLoadingSkillLevels}
        loadingMessage="Loading skill levels..."
        emptyMessage="No skill level found..."
        renderRow={(skillLevel) => (
          <>
            <TableCell maxWidth="200px">{skillLevel.skillLevelName}</TableCell>
            <TableCell maxWidth="300px">
              {skillLevel.description || "-"}
            </TableCell>
            <TableCell>
              {skillLevel.createdAt
                ? new Date(skillLevel.createdAt).toLocaleString()
                : "-"}
            </TableCell>
            <TableCell>
              {skillLevel.updatedAt
                ? new Date(skillLevel.updatedAt).toLocaleString()
                : "-"}
            </TableCell>
            <ActionsColumn
              onEdit={() => handleEdit(skillLevel)}
              onDelete={() => handleDelete(skillLevel)}
            />
          </>
        )}
      />

      {/* Add/Edit Skill Level Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={
          dialogMode === "edit" ? "Edit Skill Level" : "Add New Skill Level"
        }
        description={
          dialogMode === "edit"
            ? "Update the skill level details."
            : "Create a new skill level for your products."
        }
        onSubmit={handleSubmit}
        isLoading={dialogMode === "edit" ? isUpdating : isCreating}
        submitButtonText={
          dialogMode === "edit" ? "Update Skill Level" : "Create Skill Level"
        }
      >
        <div className="space-y-2">
          <Label htmlFor="skillLevelName">Skill Level</Label>
          <Input
            id="skillLevelName"
            name="skillLevelName"
            type="text"
            placeholder="e.g., Beginner, Intermediate, Advanced"
            value={formData.skillLevelName}
            onChange={handleChange}
            required
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter skill level description (optional)"
            value={formData.description}
            onChange={handleChange}
            disabled={dialogMode === "edit" ? isUpdating : isCreating}
            rows={4}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={selectedSkillLevel?.skillLevelName || ""}
        title="Delete Skill Level"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SkillLevelManagement;
