// Centralizes cookie options for access and refresh tokens

export const getAccessTokenCookieOptions = (accessTokenDays) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    maxAge: accessTokenDays * 24 * 60 * 60 * 1000,
  };
};

export const getRefreshTokenCookieOptions = (refreshTokenDays) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    maxAge: refreshTokenDays * 24 * 60 * 60 * 1000,
  };
};

export const getClearCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
  };
};

export const setAuthCookies = (
  res,
  accessToken,
  refreshToken,
  accessTokenDays,
  refreshTokenDays
) => {
  res.cookie(
    "accessToken",
    accessToken,
    getAccessTokenCookieOptions(accessTokenDays)
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    getRefreshTokenCookieOptions(refreshTokenDays)
  );
};

export const clearAuthCookies = (res) => {
  const options = getClearCookieOptions();
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};

