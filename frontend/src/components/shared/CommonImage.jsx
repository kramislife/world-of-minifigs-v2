import React, { useState, useEffect } from "react";
import Logo from "@/assets/media/Logo.png";

const CommonImage = ({
  src,
  alt,
  className = "",
  imgClassName = "",
  objectFit = "object-cover",
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const hasImage = typeof src === "string" && src.trim() !== "" && !hasError;

  return (
    <div className={`overflow-hidden ${className}`}>
      {hasImage ? (
        <img
          src={src}
          alt={alt || "Image"}
          className={`w-full h-full ${objectFit} ${imgClassName}`}
          onError={() => setHasError(true)}
        />
      ) : (
        <img
          src={Logo}
          alt="No image"
          className="w-full h-full object-contain opacity-20 p-2"
        />
      )}
    </div>
  );
};

export default CommonImage;
