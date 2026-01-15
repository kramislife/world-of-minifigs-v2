import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableLayout from "@/components/table/TableLayout";
import { TableCell } from "@/components/table/BaseColumn";
import useUserManagement from "@/hooks/admin/useUserManagement";

const UserManagement = () => {
  const {
    page,
    limit,
    search,
    users,
    totalItems,
    totalPages,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-popover-foreground/80 mt-2">
            View and manage all registered users
          </p>
        </div>
      </div>

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
        columns={columns}
        data={users}
        isLoading={isLoadingUsers}
        loadingMessage="Loading users..."
        emptyMessage="No users found..."
        renderRow={(user) => (
          <>
            {/* User (Avatar + Name) */}
            <TableCell maxWidth="250px">
              <div className="flex flex-col">
                <span className="font-medium">
                  {user.firstName} {user.lastName}{" "}
                  {isCurrentUser(user) && (
                    <Badge variant="accent" className="w-fit mt-1">
                      You
                    </Badge>
                  )}
                </span>
              </div>
            </TableCell>

            {/* Username */}
            <TableCell maxWidth="150px">@{user.username}</TableCell>

            {/* Email */}
            <TableCell maxWidth="200px">{user.email}</TableCell>

            {/* Contact Number */}
            <TableCell maxWidth="150px">{user.contactNumber || "-"}</TableCell>

            {/* Role */}
            <TableCell className="text-center">
              {canUpdateRole(user) ? (
                <div className="flex justify-center">
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => {
                      const userId = user._id || user.id;
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
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              )}
            </TableCell>

            {/* Status */}
            <TableCell>
              <Badge variant={user.isActive ? "accent" : "default"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>

            {/* Verified */}
            <TableCell>
              <Badge variant={user.isVerified ? "accent" : "default"}>
                {user.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </TableCell>

            {/* Joined Date */}
            <TableCell>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-"}
            </TableCell>
          </>
        )}
      />
    </div>
  );
};

export default UserManagement;
