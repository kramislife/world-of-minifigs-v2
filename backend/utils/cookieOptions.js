// Get cookie options for authentication cookies
// Handles cross-domain cookies for production deployment

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  // For cross-domain (frontend and backend on different domains)
  // SameSite must be "none" and Secure must be true
  const baseOptions = {
    httpOnly: true,
    secure: isProduction, // Must be true for SameSite: "none"
    sameSite: isProduction ? "none" : "strict", // "none" for cross-domain, "strict" for same-domain
    path: "/", // Ensure cookies are sent with all requests
  };

  return baseOptions;
};

// Convert days to milliseconds
const daysToMilliseconds = (days) => {
  return days * 24 * 60 * 60 * 1000;
};

// Get cookie options with maxAge (in milliseconds)
export const getCookieOptionsWithMaxAge = (maxAge) => {
  return {
    ...getCookieOptions(),
    maxAge,
  };
};

// Get cookie options for access token (converts days to milliseconds)
export const getAccessTokenCookieOptions = (days) => {
  return getCookieOptionsWithMaxAge(daysToMilliseconds(days));
};

// Get cookie options for refresh token (converts days to milliseconds)
export const getRefreshTokenCookieOptions = (days) => {
  return getCookieOptionsWithMaxAge(daysToMilliseconds(days));
};
