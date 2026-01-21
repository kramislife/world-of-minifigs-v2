import { v2 as cloudinary } from "cloudinary";

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    throw new Error("CLOUDINARY_API_KEY is not configured");
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is not configured");
  }
};

// Configure Cloudinary
const configureCloudinary = () => {
  validateCloudinaryConfig();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Validate image format and size
export const validateImage = (image, maxSizeMB = 5) => {
  if (!image) {
    return {
      isValid: false,
      error: "No image provided",
    };
  }

  // Validate image format
  if (!image.startsWith("data:image/")) {
    return {
      isValid: false,
      error: "Invalid image format. Please upload a valid image file.",
    };
  }

  // Check base64 image size (approximate size in bytes)
  const base64Data = image.split(",")[1] || image;
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeMB) {
    return {
      isValid: false,
      error: `Image size too large. Please upload an image smaller than ${maxSizeMB}MB.`,
    };
  }

  return {
    isValid: true,
    sizeInMB: sizeInMB.toFixed(2),
  };
};

// Standard image upload function that handles any image upload
export const uploadImage = (file, folder) => {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided for upload"));
    }

    cloudinary.uploader.upload(
      file,
      {
        resource_type: "image",
        folder: folder,
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error details:", error);
          reject(error);
        } else {
          resolve({
            public_id: result.public_id,
            url: result.url,
          });
        }
      }
    );
  });
};

// Standard function to delete any image
export const deleteImage = async (publicId) => {
  configureCloudinary();

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch (error) {
    throw new Error(`Failed to delete the image: ${error.message}`);
  }
};
