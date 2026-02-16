import { useState } from "react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/authApi";
import { handleApiError, handleApiSuccess } from "@/utils/apiHelpers";

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

      handleApiSuccess(
        response,
        "Email sent",
        "Check your email for the reset link.",
      );

      if (onSuccess) onSuccess();
    } catch (error) {
      handleApiError(
        error,
        "Request failed",
        "Unable to send reset email. Please try again.",
      );
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
