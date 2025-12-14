import { useState } from "react";
import { toast } from "sonner";
import { useRegisterMutation } from "@/redux/api/authApi";
import { passwordRequirementsConfig } from "@/constant/passwordRequirements";

export const useRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPasswordRequirements] = useState(true);
  const [register, { isLoading }] = useRegisterMutation();

  // Password requirement checks
  const passwordRequirements = {
    minLength: formData.password.length >= 6,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*_]/.test(formData.password),
  };

  // Check if all password requirements are met
  const isPasswordValid =
    passwordRequirements.minLength &&
    passwordRequirements.hasUppercase &&
    passwordRequirements.hasLowercase &&
    passwordRequirements.hasNumber &&
    passwordRequirements.hasSpecialChar;

  // Check if email is valid format
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  // Check if all required fields are filled and form is valid
  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.username.trim() !== "" &&
    formData.email.trim() !== "" &&
    isEmailValid &&
    formData.contactNumber.trim() !== "" &&
    formData.password !== "" &&
    formData.confirmPassword !== "" &&
    isPasswordValid &&
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("Validation error", {
        description: "First name is required",
      });
      return false;
    }

    if (!formData.lastName.trim()) {
      toast.error("Validation error", {
        description: "Last name is required",
      });
      return false;
    }

    if (!formData.username.trim()) {
      toast.error("Validation error", {
        description: "Username is required",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Validation error", {
        description: "Email is required",
      });
      return false;
    }

    if (!isEmailValid) {
      toast.error("Validation error", {
        description: "Please enter a valid email address",
      });
      return false;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("Validation error", {
        description: "Contact number is required",
      });
      return false;
    }

    if (!formData.password) {
      toast.error("Validation error", {
        description: "Password is required",
      });
      return false;
    }

    if (!isPasswordValid) {
      if (!passwordRequirements.minLength) {
        toast.error("Validation error", {
          description: "Password must be at least 6 characters",
        });
      } else if (!passwordRequirements.hasUppercase) {
        toast.error("Validation error", {
          description: "Password must contain at least one uppercase letter",
        });
      } else if (!passwordRequirements.hasLowercase) {
        toast.error("Validation error", {
          description: "Password must contain at least one lowercase letter",
        });
      } else if (!passwordRequirements.hasNumber) {
        toast.error("Validation error", {
          description: "Password must contain at least one number",
        });
      } else if (!passwordRequirements.hasSpecialChar) {
        toast.error("Validation error", {
          description:
            "Password must contain at least one special character (!@#$%^&*_)",
        });
      }
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Validation error", {
        description: "Passwords do not match",
      });
      return false;
    }

    if (!formData.agreeToTerms) {
      toast.error("Validation error", {
        description: "You must agree to the terms and conditions",
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
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        contactNumber: formData.contactNumber.trim(),
        password: formData.password,
      };

      await register(userData).unwrap();
      toast.success("Registration successful!", {
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.data?.message || "Registration failed. Please try again.";

      toast.error("Registration failed", {
        description: errorMessage,
      });
    }
  };

  return {
    formData,
    isLoading,
    isFormValid,
    showPasswordRequirements,
    passwordRequirements,
    passwordRequirementsConfig,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
  };
};

