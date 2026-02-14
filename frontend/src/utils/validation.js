import { toast } from "sonner";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[0-9]{11}$/;

// Validate email format
export const validateEmail = (email) => EMAIL_REGEX.test(email.trim());

// Strip non-digit characters from phone input
export const sanitizePhone = (value) => value.replace(/\D/g, "");

// Validate phone is exactly 11 digits
export const validatePhone = (phone) => PHONE_REGEX.test(phone.trim());

// Get password requirement check results
export const getPasswordRequirements = (password) => ({
  minLength: password.length >= 6,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*_]/.test(password),
});

// Check all password requirements pass
export const isPasswordValid = (requirements) =>
  requirements.minLength &&
  requirements.hasUppercase &&
  requirements.hasLowercase &&
  requirements.hasNumber &&
  requirements.hasSpecialChar;

// Show specific toast error for first unmet password requirement
export const showPasswordError = (requirements) => {
  if (!requirements.minLength) {
    toast.error("Password must be at least 6 characters", {
      description:
        "Your password needs to be longer to meet security requirements.",
    });
  } else if (!requirements.hasUppercase) {
    toast.error("Password must contain at least one uppercase letter", {
      description:
        "Add at least one capital letter (A-Z) to your password.",
    });
  } else if (!requirements.hasLowercase) {
    toast.error("Password must contain at least one lowercase letter", {
      description:
        "Add at least one lowercase letter (a-z) to your password.",
    });
  } else if (!requirements.hasNumber) {
    toast.error("Password must contain at least one number", {
      description: "Add at least one number (0-9) to your password.",
    });
  } else if (!requirements.hasSpecialChar) {
    toast.error(
      "Password must contain at least one special character (!@#$%^&*_)",
      {
        description:
          "Add at least one special character to strengthen your password.",
      },
    );
  }
};
