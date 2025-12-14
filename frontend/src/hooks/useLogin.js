import { useState } from "react";
import { toast } from "sonner";
import { useLoginMutation } from "@/redux/api/authApi";

export const useLogin = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [login, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.identifier.trim()) {
      toast.error("Validation error", {
        description: "Email or username is required",
      });
      return false;
    }

    if (!formData.password) {
      toast.error("Validation error", {
        description: "Password is required",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const credentials = {
        identifier: formData.identifier.trim().toLowerCase(),
        password: formData.password,
      };

      await login(credentials).unwrap();
      // Show success toast
      toast.success("Login successful!", {
        description: "Welcome back!",
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.data?.message ||
        (error.status === 401
          ? "Invalid email/username or password"
          : "Login failed. Please try again.");

      toast.error("Login failed", {
        description: errorMessage,
      });
    }
  };

  // Check if form is valid for button disable state
  const isFormValid =
    formData.identifier.trim() !== "" && formData.password !== "";

  return {
    formData,
    isLoading,
    isFormValid,
    handleChange,
    handleSubmit,
  };
};

