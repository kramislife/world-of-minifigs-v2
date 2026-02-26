import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { validateFile, readFileAsDataURL } from "@/utils/fileHelpers";

const useMediaPreview = ({
  multiple = false,
  maxSizeMB = 5,
  maxFiles = Infinity,
  allowVideo = false,
} = {}) => {
  const [filePreview, setFilePreview] = useState(multiple ? [] : null);
  const fileInputRef = useRef(null);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /** Clear state and file-input value */
  const resetFile = useCallback(() => {
    setFilePreview(multiple ? [] : null);
    resetFileInput();
  }, [multiple, resetFileInput]);

  /** Single-file change handler */
  const handleSingleChange = useCallback(
    async (e, { mapFile } = {}) => {
      const file = e.target.files?.[0];
      if (!file || !validateFile(file, { maxSizeMB, allowVideo })) return null;

      const dataUrl = await readFileAsDataURL(file);
      const value = mapFile ? await mapFile(dataUrl, file) : dataUrl;
      setFilePreview(value);
      return value;
    },
    [maxSizeMB, allowVideo],
  );

  /** Single-file remove handler */
  const handleSingleRemove = useCallback(() => {
    setFilePreview(null);
    resetFileInput();
  }, [resetFileInput]);

  /** Multi-file change handler — appends new items */
  const handleMultipleChange = useCallback(
    async (e, { mapFile } = {}) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return [];

      // Guard: max files check (snapshot current length synchronously)
      let blocked = false;
      setFilePreview((current) => {
        const currentCount = Array.isArray(current) ? current.length : 0;
        const available = maxFiles - currentCount;

        if (available <= 0) {
          toast.error("Maximum files reached", {
            description: `You can upload up to ${maxFiles} files.`,
          });
          blocked = true;
          return current;
        }

        if (files.length > available) {
          toast.error("Too many files", {
            description: `You can only add ${available} more file${available !== 1 ? "s" : ""}. Max ${maxFiles} allowed.`,
          });
          blocked = true;
          return current;
        }

        return current;
      });

      if (blocked) {
        resetFileInput();
        return [];
      }

      const validFiles = files.filter((f) =>
        validateFile(f, { maxSizeMB, allowVideo }),
      );
      if (validFiles.length === 0) {
        resetFileInput();
        return [];
      }

      const dataUrls = await Promise.all(validFiles.map(readFileAsDataURL));
      const items = mapFile
        ? await Promise.all(
            dataUrls.map((url, i) => mapFile(url, validFiles[i])),
          )
        : dataUrls;

      setFilePreview((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        ...items,
      ]);
      resetFileInput();
      return items;
    },
    [maxFiles, maxSizeMB, allowVideo, resetFileInput],
  );

  /** Multi-file remove by index */
  const handleMultipleRemove = useCallback((index) => {
    setFilePreview((prev) =>
      Array.isArray(prev) ? prev.filter((_, i) => i !== index) : prev,
    );
  }, []);

  return {
    // Canonical state
    filePreview,
    setFilePreview,
    fileInputRef,

    // Canonical actions
    resetFile,
    handleFileChange: multiple ? handleMultipleChange : handleSingleChange,
    handleRemoveFile: multiple ? handleMultipleRemove : handleSingleRemove,
  };
};

export default useMediaPreview;
