import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import TableLayout from "@/components/table/TableLayout";
import { TableCell, TimestampCells } from "@/components/table/BaseColumn";
import { formatFullName } from "@/utils/formatting";
import useUserManagement from "@/hooks/admin/useUserManagement";

const UserManagement = () => {
  const {
    users,
    totalItems,
    totalPages,
    page,
    limit,
    search,
    startItem,
    endItem,
    handlePrevious,
    handleNext,
    columns,
    isLoadingUsers,
    isUpdatingRole,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleUpdateRole,
    isCurrentUser,
    getRoleBadgeVariant,
    canUpdateRole,
  } = useUserManagement();

  return (
    <div className="space-y-5">
      <AdminManagementHeader
        title="User Management"
        description="View and manage all registered users"
      />

      <TableLayout
        searchPlaceholder="Search users..."
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
        data={users}
        isLoading={isLoadingUsers}
        renderRow={(user) => (
          <>
            {/* User (Avatar + Name) */}
            <TableCell maxWidth="250px">
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatFullName(user)}{" "}
                  {isCurrentUser(user) && (
                    <Badge variant="accent" className="text-[10px] ml-1">
                      You
                    </Badge>
                  )}
                </span>
              </div>
            </TableCell>

            {/* Username */}
            <TableCell maxWidth="150px">{user.username}</TableCell>

            {/* Email */}
            <TableCell maxWidth="200px">{user.email}</TableCell>

            {/* Contact Number */}
            <TableCell maxWidth="150px">{user.contactNumber}</TableCell>

            {/* Role */}
            <TableCell className="text-center">
              {canUpdateRole(user) ? (
                <div className="flex justify-center">
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => {
                      const userId = user._id;
                      handleUpdateRole(userId, newRole);
                    }}
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className="capitalize"
                >
                  {user.role}
                </Badge>
              )}
            </TableCell>

            {/* Status */}
            <TableCell>
              <StatusBadge isActive={user.isActive} />
            </TableCell>

            {/* Verified */}
            <TableCell>
              <StatusBadge
                isActive={user.isVerified}
                activeLabel="Verified"
                inactiveLabel="Unverified"
              />
            </TableCell>

            {/* Joined Date */}
            <TimestampCells createdAt={user.createdAt} />
          </>
        )}
      />
    </div>
  );
};

export default UserManagement;
