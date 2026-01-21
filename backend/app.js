import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDatabase from "./config/dbConnect.js";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if ((process.env.NODE_ENV || "").toLowerCase() !== "production") {
  dotenv.config({ path: "./config/config.env", quiet: true });
}

const validateEnv = () => {
  const requiredVars = [
    "JWT_ACCESS_TOKEN_SECRET",
    "JWT_REFRESH_TOKEN_SECRET",
    "FRONTEND_URL",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = requiredVars.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }

  // Optional numeric validations – only if set
  const numericEnv = [
    "JWT_ACCESS_TOKEN_EXPIRY",
    "JWT_REFRESH_TOKEN_EXPIRY",
    "SMTP_PORT",
  ];

  numericEnv.forEach((name) => {
    const value = process.env[name];
    if (value !== undefined) {
      const num = Number.parseInt(value, 10);
      if (!Number.isFinite(num) || num <= 0) {
        console.error(
          `Invalid numeric value for ${name}: "${value}". It must be a positive number.`
        );
        process.exit(1);
      }
    }
  });
};

validateEnv();

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/public", publicRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../frontend/dist");
  
  app.use(express.static(frontendDistPath));
  
  // Handle React routing - return all non-API requests to React app
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  // 404 handler for development (API routes only)
  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
}

// Start server after DB connects
const PORT = process.env.PORT || 4000;
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Backend running on port ${PORT} in ${process.env.NODE_ENV} mode`
    );
  });
});