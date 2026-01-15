import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import TableLayout from "@/components/table/TableLayout";
import { TableCell } from "@/components/table/BaseColumn";
import { useGetUsersQuery } from "@/redux/api/adminApi";

const UserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsersQuery({
    page,
    limit,
    search: search || undefined, // Only send if not empty
  });

  // Extract data from server response
  const users = usersResponse?.users || [];
  const totalItems = usersResponse?.pagination?.totalItems || 0;
  const totalPages = usersResponse?.pagination?.totalPages || 1;

  // Column definitions
  const columns = [
    { key: "user", label: "User" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "verified", label: "Verified" },
    { key: "createdAt", label: "Joined" },
  ];

  const isCurrentUser = (user) => {
    const currentUserId = currentUser?._id || currentUser?.id;
    const userId = user._id || user.id;
    return userId === currentUserId;
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "seller":
        return "default";
      case "customer":
        return "secondary";
      default:
        return "outline";
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
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
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
