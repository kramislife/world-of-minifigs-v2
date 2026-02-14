import { toast } from "sonner";

// Validate a file's type and size before processing
// options: { maxSizeMB = 5, allowVideo = false }
export const validateFile = (
  file,
  { maxSizeMB = 5, allowVideo = false } = {},
) => {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !(allowVideo && isVideo)) {
    toast.error("Invalid file type", {
      description: allowVideo
        ? "Please select an image or video file."
        : "Please select an image file.",
    });
    return false;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    toast.error("File too large", {
      description: `File must be less than ${maxSizeMB}MB.`,
    });
    return false;
  }

  return true;
};

// Read a file as a base64 data URL (Promise-based)
export const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
