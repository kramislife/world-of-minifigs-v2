import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useResetPasswordMutation,
  useForgotPasswordMutation,
} from "@/redux/api/authApi";
import { passwordRequirementsConfig } from "@/constant/passwordRequirements";
import { handleApiError, handleApiSuccess } from "@/utils/apiHelpers";
import {
  getPasswordRequirements,
  isPasswordValid,
  showPasswordError,
} from "@/utils/validation";

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [resendEmail, setResendEmail] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [resetStatus, setResetStatus] = useState("validating");
  const [authOpen, setAuthOpen] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [forgotPassword, { isLoading: isResending }] =
    useForgotPasswordMutation();

  const hasValidated = useRef(false);
  const isValidating = useRef(false);

  // Password requirement checks
  const passwordRequirements = getPasswordRequirements(formData.password);
  const passwordValid = isPasswordValid(passwordRequirements);

  // Validate token on mount
  useEffect(() => {
    if (hasValidated.current || isValidating.current) return;

    if (!token) {
      hasValidated.current = true;
      setResetStatus("error");
      toast.error("Reset link missing", {
        description:
          "No reset token found. Please use the link from your email.",
      });
      return;
    }

    const validateToken = async () => {
      isValidating.current = true;

      try {
        await resetPassword({ token, password: "" }).unwrap();
        setResetStatus("idle");
      } catch (error) {
        const message = error?.data?.message?.toLowerCase() || "";

        if (message.includes("expired") || message.includes("invalid")) {
          hasValidated.current = true;
          setResetStatus("error");
          toast.error(error?.data?.message || "Reset link expired", {
            description:
              error?.data?.description ||
              "Please request a new password reset link.",
          });
        } else {
          hasValidated.current = true;
          setResetStatus("idle");
        }
      } finally {
        isValidating.current = false;
      }
    };

    validateToken();
  }, [token, resetPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    if (formData.password === "") {
      setShowPasswordRequirements(false);
    }
  };

  const handleGoToLogin = () => {
    setAuthOpen(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const validateForm = () => {
    if (!formData.password) {
      toast.error("Password is required", {
        description: "Please enter a new password.",
      });
      return false;
    }

    if (!passwordValid) {
      showPasswordError(passwordRequirements);
      return false;
    }

    if (!formData.confirmPassword) {
      toast.error("Confirm password is required", {
        description: "Please re-enter your new password.",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both fields contain the same value.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await resetPassword({
        token,
        password: formData.password,
      }).unwrap();

      handleApiSuccess(
        response,
        "Password reset successful",
        "You can now sign in with your new password.",
      );

      setResetStatus("success");
    } catch (error) {
      console.error("Reset password error:", error);

      const message = error?.data?.message?.toLowerCase() || "";
      if (message.includes("expired") || message.includes("invalid")) {
        setResetStatus("error");
      }

      handleApiError(
        error,
        "Password reset failed",
        "Unable to reset password. Please try again.",
      );
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const email = resendEmail.trim().toLowerCase();

    if (!email) {
      toast.error("Email is required", {
        description: "Please enter the email associated with your account.",
      });
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();

      handleApiSuccess(
        response,
        "Reset link sent",
        "Check your email for the new reset link.",
      );
    } catch (error) {
      console.error("Resend reset link error:", error);
      handleApiError(
        error,
        "Unable to send reset link",
        "Please try again later.",
      );
    }
  };

  return {
    formData,
    isLoading,
    resetStatus,
    showPasswordRequirements,
    passwordRequirements,
    passwordRequirementsConfig,
    isSubmitDisabled: isLoading,
    authOpen,
    setAuthOpen,
    resendEmail,
    setResendEmail,
    isResending,
    handleChange,
    handlePasswordFocus,
    handlePasswordBlur,
    handleSubmit,
    handleResend,
    handleGoToLogin,
    handleGoHome,
  };
};
