import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import { getVerificationEmailTemplate } from "../utils/Email/verifyEmail.js";
import { generateTokens } from "../utils/generateToken.js";

// ---------------------------------- Constants --------------------------------------

export const MIN_RESPONSE_TIME_MS = 3000;
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------ User Response Sanitisation --------------------------------------

export const sanitiseUserForResponse = (user, includeProfile = false) => {
  const base = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    contactNumber: user.contactNumber,
    role: user.role,
    isVerified: user.isVerified,
  };
  if (includeProfile) {
    base.profilePicture = user.profilePicture;
  }
  return base;
};

// ------------------------ Verification Token Generation ------------------------------------

export const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date();
  expiry.setHours(
    expiry.getHours() +
      parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || "1", 10),
  );
  return { token, expiry };
};

export const buildVerificationUrl = (token) =>
  `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

// ------------------------ Password Hashing ------------------------------------

export const hashPassword = (password) => bcrypt.hash(String(password), 10);

export const comparePassword = (plain, hashed) =>
  bcrypt.compare(String(plain), hashed);

// ------------------------ Send Verification Email ------------------------------

export const sendVerificationEmail = async (user, verificationUrl) => {
  try {
    await sendEmail({
      email: user.email,
      subject: `Verify Your Email Address - ${
        process.env.SMTP_FROM_NAME || "World of Minifigs"
      }`,
      message: getVerificationEmailTemplate(user, verificationUrl),
    });
    return true;
  } catch (emailError) {
    console.error("Error sending verification email:", {
      userId: user._id,
      email: user.email,
      error: emailError.message,
      stack: emailError.stack,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
};

// ------------------------ Token Generation + Refresh Token Persistence --------------------

export const issueTokensForUser = async (user) => {
  const { accessToken, refreshToken } = generateTokens(user._id);

  const accessTokenDays = Number(process.env.JWT_ACCESS_TOKEN_EXPIRY) || 1;
  const refreshTokenDays = Number(process.env.JWT_REFRESH_TOKEN_EXPIRY) || 7;
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + refreshTokenDays);

  user.lastLogin = new Date();
  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = refreshTokenExpiry;
  await user.save();

  return { accessToken, refreshToken, accessTokenDays, refreshTokenDays };
};

// ------------------------ Password Reset Token ------------------------------------

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { resetToken, hashedToken, expiry };
};

// ------------------------ Find User by Identifier --------------------

export const findUserByIdentifier = (identifier) =>
  User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() },
    ],
  });
