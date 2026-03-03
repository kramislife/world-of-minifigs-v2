import React from "react";
import { Badge } from "@/components/ui/badge";
import { AdminFormSelect } from "@/components/shared/AdminFormInput";
import AdminManagementHeader from "@/components/shared/AdminManagementHeader";
import TableLayout from "@/components/table/TableLayout";
import {
  TableCell,
  TimestampCells,
  StatusCell,
} from "@/components/table/BaseColumn";
import { formatFullName, display } from "@/utils/formatting";
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
            <TableCell maxWidth="150px">{display(user.username)}</TableCell>

            {/* Email */}
            <TableCell maxWidth="200px">{display(user.email)}</TableCell>

            {/* Contact Number */}
            <TableCell maxWidth="150px">
              {display(user.contactNumber)}
            </TableCell>

            {/* Role */}
            <TableCell className="text-center">
              {canUpdateRole(user) ? (
                <div className="flex justify-center">
                  <AdminFormSelect
                    value={user.role}
                    onValueChange={(newRole) =>
                      handleUpdateRole(user._id, newRole)
                    }
                    options={[
                      { value: "customer", label: "Customer" },
                      { value: "dealer", label: "Dealer" },
                    ]}
                    disabled={isUpdatingRole}
                  />
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
            <StatusCell isActive={user.isActive} />

            {/* Verified */}
            <StatusCell
              isActive={user.isVerified}
              activeLabel="Verified"
              inactiveLabel="Unverified"
            />

            {/* Joined Date */}
            <TimestampCells createdAt={user.createdAt} />
          </>
        )}
      />
    </div>
  );
};

export default UserManagement;
