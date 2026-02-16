import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "@/redux/api/adminApi";
import { extractPaginatedData } from "@/utils/apiHelpers";
import { handleApiError, handleApiSuccess } from "@/utils/apiHelpers";

const useUserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsersQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();

  const {
    items: users,
    totalItems,
    totalPages,
  } = extractPaginatedData(usersResponse, "users");

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
      case "dealer":
        return "default";
      case "customer":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await updateUserRole({
        id: userId,
        role: newRole,
      }).unwrap();

      if (response.success) {
        handleApiSuccess(response, "User role updated successfully");
      }
    } catch (error) {
      handleApiError(error, "Failed to update user role");
    }
  };

  const canUpdateRole = (user) => user.role !== "admin";

  // Pagination Handlers
  const handlePageChange = (newPage) => setPage(newPage);
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
    page,
    limit,
    search,
    users,
    totalItems,
    totalPages,
    columns,
    isLoadingUsers,
    isUpdatingRole,
    currentUser,

    // Handlers
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleUpdateRole,
    isCurrentUser,
    getRoleBadgeVariant,
    canUpdateRole,
  };
};

export default useUserManagement;
