// --------------------------- Standard Response Helpers ---------------------------

export const handleError = (res, error, logPrefix, customMessage) => {
  console.error(`${logPrefix}:`, error);
  res.status(500).json({
    success: false,
    message: customMessage || "Internal server error",
    description: "An unexpected error occurred. Please try again.",
  });
};

// --------------------------- Name Conflict Checks ---------------------------

export const checkNameConflict = async (
  Model,
  field,
  value,
  excludeId = null,
  extraQuery = {},
) => {
  const query = { [field]: value, ...extraQuery };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Model.findOne(query).collation({ locale: "en", strength: 2 }).lean();
};

// --------------------------- Password Validation ---------------------------

export const validatePassword = (password) => {
  const passwordStr = String(password);
  const hasMinLength = passwordStr.length >= 6;
  const hasUppercase = /[A-Z]/.test(passwordStr);
  const hasLowercase = /[a-z]/.test(passwordStr);
  const hasNumber = /[0-9]/.test(passwordStr);
  const hasSpecialChar = /[!@#$%^&*_]/.test(passwordStr);

  if (
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  ) {
    return null; // valid
  }

  if (!hasMinLength) {
    return {
      message: "Password too short",
      description: "Password must be at least 6 characters long.",
    };
  }
  if (!hasUppercase) {
    return {
      message: "Missing uppercase letter",
      description: "Password must contain at least one uppercase letter (A-Z).",
    };
  }
  if (!hasLowercase) {
    return {
      message: "Missing lowercase letter",
      description: "Password must contain at least one lowercase letter (a-z).",
    };
  }
  if (!hasNumber) {
    return {
      message: "Missing number",
      description: "Password must contain at least one number (0-9).",
    };
  }
  // hasSpecialChar must be false at this point
  return {
    message: "Missing special character",
    description:
      "Password must contain at least one special character (!@#$%^&*_).",
  };
};
