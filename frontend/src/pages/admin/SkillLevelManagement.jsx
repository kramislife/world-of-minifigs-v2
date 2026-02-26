import React from "react";
import { formatDate } from "@/utils/formatting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
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
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingSkillLevels,
    isSubmitting,
    isDeleting,
    handleChange,
    handleSwitchChange,
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
      <AdminManagementHeader
        title="Skill Level Management"
        description="Manage product skill levels in your store"
        actionLabel="Add Skill Level"
        onAction={handleAdd}
      />

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
            <TableCell maxWidth="200px">{skillLevel.skillLevelName}</TableCell>
            <TableCell maxWidth="300px">
              {skillLevel.description || "-"}
            </TableCell>
            <TableCell>
              {skillLevel.isActive ? (
                <Badge variant="accent">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {skillLevel.createdAt ? formatDate(skillLevel.createdAt) : "-"}
            </TableCell>
            <TableCell>
              {skillLevel.updatedAt ? formatDate(skillLevel.updatedAt) : "-"}
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
        isLoading={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Label htmlFor="isActive">Visibility</Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When disabled, this skill level will not appear in product filters
              or public listings
            </p>
          </div>

          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              handleSwitchChange("isActive", checked)
            }
            disabled={isSubmitting}
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
