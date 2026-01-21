import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useSkillLevelManagement from "@/hooks/admin/useSkillLevelManagement";

const SkillLevelManagement = () => {
  const {
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
  } = useSkillLevelManagement();

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
