import React from "react";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  ActionsColumn,
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import VisibilitySwitch from "@/components/shared/VisibilitySwitch";
import {
  AdminFormInput,
  AdminFormTextarea,
} from "@/components/shared/AdminFormInput";
import AddUpdateItemDialog from "@/components/table/AddUpdateItemDialog";
import DeleteDialog from "@/components/table/DeleteDialog";
import { display } from "@/utils/formatting";
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
            <StatusCell isActive={skillLevel.isActive} />

            {/* Timestamps */}
            <TimestampCells
              createdAt={skillLevel.createdAt}
              updatedAt={skillLevel.updatedAt}
            />

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
        entityName="Skill Level"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {/* Skill Level Name */}
          <AdminFormInput
            label="Skill Level"
            name="skillLevelName"
            placeholder="Beginner, Intermediate, Advanced"
            value={formData.skillLevelName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          {/* Description */}
          <AdminFormTextarea
            label="Description"
            name="description"
            placeholder="Enter skill level description..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Visibility */}
          <VisibilitySwitch
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
