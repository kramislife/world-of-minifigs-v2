import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "@/redux/api/adminApi";

const useUserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");

  // Fetch data with pagination and search
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsersQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();

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
        toast.success(response.message, {
          description:
            response.description ||
            `The user's role has been updated to ${newRole}.`,
        });
      }
    } catch (error) {
      console.error("Update user role error:", error);
      toast.error(error?.data?.message || "Failed to update user role", {
        description:
          error?.data?.description ||
          "An unexpected error occurred. Please try again.",
      });
    }
  };

  const canUpdateRole = (user) => {
    // Only allow updating non-admin users
    return user.role !== "admin";
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
