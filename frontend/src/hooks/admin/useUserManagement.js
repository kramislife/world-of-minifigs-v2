import { useSelector } from "react-redux";
import { useEffect } from "react";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "@/redux/api/adminApi";
import {
  extractPaginatedData,
  handleApiError,
  handleApiSuccess,
} from "@/utils/apiHelpers";
import useAdminCrud from "@/hooks/admin/useAdminCrud";

const useUserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const crud = useAdminCrud({
    initialFormData: {},
    // User management doesn't use standard CRUD functions for everything,
    // but we use useAdminCrud for centralized table logic.
    createFn: null,
    updateFn: null,
    deleteFn: null,
  });

  // Fetch data
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsersQuery({
    page: crud.page,
    limit: crud.limit,
    search: crud.search || undefined,
  });

  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();

  const {
    items: users,
    totalItems,
    totalPages,
  } = extractPaginatedData(usersResponse, "users");

  // Sync totalItems back to crud hook for calculations
  useEffect(() => {
    crud.setTotalItems(totalItems);
  }, [totalItems, crud]);

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

  return {
    ...crud,
    users,
    totalItems,
    totalPages,
    columns,
    isLoadingUsers,
    isUpdatingRole,
    currentUser,

    // Handlers
    handleUpdateRole,
    isCurrentUser,
    getRoleBadgeVariant,
    canUpdateRole,
  };
};

export default useUserManagement;
