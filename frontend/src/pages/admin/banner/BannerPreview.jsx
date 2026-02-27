import React from "react";

const BannerPreview = ({
  formData,
  isDarkTheme,
  isLightTheme,
  layoutClasses,
  getButtonStyle,
}) => {
  const { container, buttons } = layoutClasses;

  return (
    <>
      {/* Overlay Content */}
      <div
        className={`absolute inset-0 z-10 flex h-full w-full p-5 transition-all duration-300 ${container} ${
          isDarkTheme
            ? "text-foreground dark:text-secondary-foreground"
            : "text-background dark:text-foreground"
        }`}
      >
        <div className="max-w-3xl space-y-2">
          {formData.badge && (
            <p className="uppercase tracking-widest text-xs">
              {formData.badge}
            </p>
          )}

          {formData.label && (
            <h3 className="text-xl sm:text-2xl font-extrabold uppercase">
              {formData.label}
            </h3>
          )}

          {formData.description && (
            <p className="text-xs line-clamp-2">{formData.description}</p>
          )}

          {formData.enableButtons && formData.buttons?.some((b) => b.label) && (
            <div className={`flex gap-2 pt-2 ${buttons}`}>
              {formData.buttons
                .filter((b) => b.label)
                .map((btn, i) => (
                  <div
                    key={i}
                    className={`px-4 py-2 text-[8px] font-bold uppercase border pointer-events-none ${getButtonStyle(
                      btn,
                    )}`}
                  >
                    {btn.label}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Dark Overlay */}
      {isLightTheme && <div className="absolute inset-0 bg-black/20 z-0" />}
    </>
  );
};

export default BannerPreview;
