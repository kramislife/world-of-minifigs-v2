import { useState } from "react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/authApi";

export const useForgotPassword = (onSuccess) => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Email is required", {
        description: "Please enter your email address.",
      });
      return;
    }

    try {
      const response = await forgotPassword({
        email: trimmedEmail.toLowerCase(),
      }).unwrap();

      toast.success(response?.message || "Email sent", {
        description:
          response?.description || "Check your email for the reset link.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || "Request failed", {
        description:
          error?.data?.description ||
          "Unable to send reset email. Please try again.",
      });
    }
  };

  return {
    email,
    isLoading,
    isSubmitDisabled: isLoading,
    handleChange,
    handleSubmit,
  };
};
