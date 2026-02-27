import React from "react";
import { formatDate, display } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import { ActionsColumn, TableCell } from "@/components/table/BaseColumn";
import AdminSwitchField from "@/components/shared/AdminSwitchField";
import StatusBadge from "@/components/shared/StatusBadge";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import useSkillLevelManagement from "@/hooks/admin/useSkillLevelManagement";

const SkillLevelManagement = () => {
  const {
    dialogOpen,
    deleteDialogOpen,
    selectedItem,
    dialogMode,
    formData,
    page,
    limit,
    search,
    skillLevels,
    totalItems,
    totalPages,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingSkillLevels,
    isSubmitting,
    isDeleting,
    handleChange,
    handleValueChange,
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
      {/* Admin Page Header */}
      <AdminManagementHeader
        title="Skill Level Management"
        description="Manage product skill levels in your store"
        actionLabel="Add Skill Level"
        onAction={handleAdd}
      />

      {/* Table Layout */}
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
        startItem={startItem}
        endItem={endItem}
        onPrevious={handlePrevious}
        onNext={handleNext}
        columns={columns}
        data={skillLevels}
        isLoading={isLoadingSkillLevels}
        renderRow={(skillLevel) => (
          <>
            {/* Skill Level Name */}
            <TableCell maxWidth="200px">
              {display(skillLevel.skillLevelName)}
            </TableCell>

            {/* Description */}
            <TableCell maxWidth="300px">
              {display(skillLevel.description)}
            </TableCell>

            {/* Status */}
            <TableCell>
              <StatusBadge isActive={skillLevel.isActive} />
            </TableCell>

            {/* Created At */}
            <TableCell>{formatDate(skillLevel.createdAt)}</TableCell>

            {/* Updated At */}
            <TableCell>{formatDate(skillLevel.updatedAt)}</TableCell>

            {/* Actions */}
            <ActionsColumn
              onEdit={() => handleEdit(skillLevel)}
              onDelete={() => handleDelete(skillLevel)}
            />
          </>
        )}
      />

      {/* Add/Update Dialog */}
      <AddUpdateItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        title={dialogMode === "edit" ? "Edit Skill Level" : "Add Skill Level"}
        description={
          dialogMode === "edit"
            ? "Update the skill level details."
            : "Create a new skill level for your products."
        }
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        submitButtonText={
          dialogMode === "edit" ? "Update Skill Level" : "Create Skill Level"
        }
      >
        <div className="space-y-4">
          {/* Skill Level Name */}
          <div className="space-y-2">
            <Label htmlFor="skillLevelName">Skill Level</Label>
            <Input
              id="skillLevelName"
              name="skillLevelName"
              placeholder="e.g., Beginner, Intermediate, Advanced"
              value={formData.skillLevelName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter skill level description (optional)"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          {/* Visibility */}
          <AdminSwitchField
            id="isActive"
            label="Visibility"
            description="When disabled, this skill level will not appear in product filters or public listings"
            checked={formData.isActive}
            onChange={handleValueChange("isActive")}
            disabled={isSubmitting}
          />
        </div>
      </AddUpdateItemDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={display(selectedItem?.skillLevelName)}
        title="Delete Skill Level"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SkillLevelManagement;
