import Banner from "../models/banner.model.js";
import {
  validateBannerMedia,
  uploadBannerMedia,
  deleteMedia,
} from "../utils/cloudinary.js";

//------------------------------------------------ Create Banner ------------------------------------------
export const createBanner = async (req, res) => {
  try {
    const {
      badge,
      label,
      description,
      position,
      textTheme,
      media,
      enableButtons,
      buttons,
      isActive,
    } = req.body;

    // Required fields
    if (!label || !label.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner label is required",
        description: "Please provide a banner label.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner description is required",
        description: "Please provide a banner description.",
      });
    }

    if (!media) {
      return res.status(400).json({
        success: false,
        message: "Banner media is required",
        description: "Please upload a banner image, gif, or video.",
      });
    }

    if (
      position &&
      !["center", "bottom-left", "bottom-right"].includes(position)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner position",
        description: "Position must be center, bottom-left, or bottom-right.",
      });
    }

    // Validate media
    const mediaValidation = validateBannerMedia(media);

    if (!mediaValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner media",
        description: mediaValidation.error,
      });
    }

    // Validate buttons
    const finalEnableButtons =
      enableButtons !== undefined ? Boolean(enableButtons) : false;

    if (finalEnableButtons) {
      if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
        return res.status(400).json({
          success: false,
          message: "CTA buttons are required",
          description: "At least one CTA button must be provided.",
        });
      }

      if (buttons.length > 2) {
        return res.status(400).json({
          success: false,
          message: "Too many CTA buttons",
          description: "Maximum of 2 CTA buttons are allowed.",
        });
      }

      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];

        if (!btn.label || !btn.label.trim()) {
          return res.status(400).json({
            success: false,
            message: `Button ${i + 1}: Label is required`,
            description: "Each CTA button must have a label.",
          });
        }

        if (!btn.href || !btn.href.trim()) {
          return res.status(400).json({
            success: false,
            message: `Button ${i + 1}: Link (href) is required`,
            description: "Each CTA button must have a link.",
          });
        }

        const validPaths = [
          "/products",
          "/collections",
          "/about",
          "/contact-us",
          "/designer",
          "/privacy-policy",
          "/terms-of-use",
        ];

        const isStaticPath = validPaths.some((p) => btn.href === p);
        const isDynamicPath =
          btn.href.startsWith("/products/") ||
          btn.href.startsWith("/collections/");

        if (!isStaticPath && !isDynamicPath) {
          return res.status(400).json({
            success: false,
            message: `Button ${i + 1}: Invalid link`,
            description:
              "Link must be a valid page (e.g., /products, /collections) or a specific item path.",
          });
        }
      }
    }

    // Upload media
    let uploadedMedia = null;

    try {
      const uploadResult = await uploadBannerMedia(
        media,
        "world-of-minifigs-v2/banners",
      );

      // Enforce video duration rule here (controller layer)
      if (
        uploadResult.resourceType === "video" &&
        typeof uploadResult.duration === "number" &&
        uploadResult.duration > 30
      ) {
        try {
          await deleteMedia(uploadResult.publicId, uploadResult.resourceType);
        } catch (e) {}

        return res.status(400).json({
          success: false,
          message: "Video is too long",
          description: "Banner video must not exceed 30 seconds.",
        });
      }

      uploadedMedia = uploadResult;
    } catch (error) {
      console.error("Banner media upload error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to upload banner media",
        description:
          "An error occurred while uploading the banner media. Please try again.",
      });
    }

    // Get the next available order
    const lastBanner = await Banner.findOne()
      .sort({ order: -1 })
      .select("order");
    const nextOrder = lastBanner && lastBanner.order ? lastBanner.order + 1 : 1;

    const bannerData = {
      badge: badge?.trim() || undefined,
      label: label.trim(),
      description: description.trim(),
      position: position || "center",
      textTheme: textTheme || "light",
      media: {
        publicId: uploadedMedia.publicId,
        url: uploadedMedia.url,
        resourceType: uploadedMedia.resourceType,
        duration: uploadedMedia.duration,
      },
      enableButtons: finalEnableButtons,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: nextOrder,
      createdBy: req.user._id,
    };

    if (finalEnableButtons) {
      bannerData.buttons = buttons.map((b) => ({
        label: b.label.trim(),
        href: b.href.startsWith("/") ? b.href.trim() : `/${b.href.trim()}`,
        variant: b.variant || "default",
      }));
    }

    const banner = await Banner.create(bannerData);

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner: {
        id: banner._id,
        badge: banner.badge,
        label: banner.label,
        description: banner.description,
        position: banner.position,
        textTheme: banner.textTheme,
        media: banner.media,
        enableButtons: banner.enableButtons,
        buttons: banner.buttons,
        isActive: banner.isActive,
        order: banner.order,
        createdAt: banner.createdAt,
      },
    });
  } catch (error) {
    console.error("Create banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create banner",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get All Banners ------------------------------------------
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1 })
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username")
      .lean();

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("Get all banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get Single Banner ------------------------------------------
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
        description: "Please provide a valid banner ID.",
      });
    }

    const banner = await Banner.findById(id)
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username")
      .lean();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
        description: "The requested banner does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error("Get banner by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Update Banner ------------------------------------------
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      badge,
      label,
      description,
      position,
      textTheme,
      media, // base64 if new media is uploaded
      enableButtons,
      buttons,
      isActive,
      order,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
        description: "Please provide a valid banner ID.",
      });
    }

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
        description: "The requested banner does not exist.",
      });
    }

    if (label !== undefined && !label.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner label is required",
        description: "Please provide a banner label.",
      });
    }

    if (description !== undefined && !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner description is required",
        description: "Please provide a banner description.",
      });
    }

    if (
      position !== undefined &&
      !["center", "bottom-left", "bottom-right"].includes(position)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner position",
        description: "Position must be center, bottom-left, or bottom-right.",
      });
    }

    const finalEnableButtons =
      enableButtons !== undefined
        ? Boolean(enableButtons)
        : banner.enableButtons;

    if (finalEnableButtons) {
      if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
        return res.status(400).json({
          success: false,
          message: "CTA buttons are required",
          description: "At least one CTA button must be provided.",
        });
      }

      if (buttons.length > 2) {
        return res.status(400).json({
          success: false,
          message: "Too many CTA buttons",
          description: "Maximum of 2 CTA buttons are allowed.",
        });
      }

      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];

        if (!btn.label || !btn.label.trim()) {
          return res.status(400).json({
            success: false,
            message: `Button ${i + 1}: Label is required`,
            description: "Each CTA button must have a label.",
          });
        }

        if (!btn.href || !btn.href.trim()) {
          return res.status(400).json({
            success: false,
            message: `Button ${i + 1}: Link (href) is required`,
            description: "Each CTA button must have a link.",
          });
        }

        const validPaths = [
          "/products",
          "/collections",
          "/about",
          "/contact-us",
          "/designer",
          "/privacy-policy",
          "/terms-of-use",
        ];

        const isStaticPath = validPaths.some((p) => btn.href === p);
        const isDynamicPath =
          btn.href.startsWith("/products/") ||
          btn.href.startsWith("/collections/");

        if (!isStaticPath && !isDynamicPath) {
          return res.status(400).json({
            success: false,
            message: `Button ${i + 1}: Invalid link`,
            description:
              "Link must be a valid page (e.g., /products, /collections) or a specific item path.",
          });
        }
      }
    }

    // Replace media if new media is provided
    if (media) {
      const mediaValidation = validateBannerMedia(media);

      if (!mediaValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid banner media",
          description: mediaValidation.error,
        });
      }

      let uploadResult = null;

      try {
        uploadResult = await uploadBannerMedia(
          media,
          "world-of-minifigs-v2/banners",
        );

        if (
          uploadResult.resourceType === "video" &&
          typeof uploadResult.duration === "number" &&
          uploadResult.duration > 30
        ) {
          try {
            await deleteMedia(uploadResult.publicId, uploadResult.resourceType);
          } catch (e) {}

          return res.status(400).json({
            success: false,
            message: "Video is too long",
            description: "Banner video must not exceed 30 seconds.",
          });
        }
      } catch (error) {
        console.error("Banner media upload error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to upload banner media",
          description:
            "An error occurred while uploading the banner media. Please try again.",
        });
      }

      // Delete old media
      if (banner.media?.publicId) {
        try {
          await deleteMedia(banner.media.publicId, banner.media.resourceType);
        } catch (error) {
          console.error("Error deleting old banner media:", error);
        }
      }

      banner.media = {
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        resourceType: uploadResult.resourceType,
        duration: uploadResult.duration,
      };
    }

    if (badge !== undefined) banner.badge = badge?.trim() || undefined;
    if (label !== undefined) banner.label = label.trim();
    if (description !== undefined) banner.description = description.trim();
    if (position !== undefined) banner.position = position;
    if (textTheme !== undefined) banner.textTheme = textTheme;
    if (enableButtons !== undefined)
      banner.enableButtons = Boolean(enableButtons);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);

    if (finalEnableButtons) {
      banner.buttons = buttons.map((b) => ({
        label: b.label.trim(),
        href: b.href.startsWith("/") ? b.href.trim() : `/${b.href.trim()}`,
        variant: b.variant || "default",
      }));
    } else {
      banner.buttons = undefined;
    }

    // Handle Reordering Logic
    if (order !== undefined && order !== banner.order) {
      const oldOrder = banner.order;
      const newOrder = parseInt(order);

      if (isNaN(newOrder) || newOrder < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid order value",
          description: "Order must be a positive number.",
        });
      }

      // Get count to cap the new order
      const count = await Banner.countDocuments();
      const targetOrder = Math.min(newOrder, count);

      if (oldOrder < targetOrder) {
        // Move DOWN (old < new): decrement items in (old, targetOrder]
        await Banner.updateMany(
          { order: { $gt: oldOrder, $lte: targetOrder } },
          { $inc: { order: -1 } },
        );
      } else {
        // Move UP (old > new): increment items in [targetOrder, old)
        await Banner.updateMany(
          { order: { $gte: targetOrder, $lt: oldOrder } },
          { $inc: { order: 1 } },
        );
      }
      banner.order = targetOrder;
    }

    banner.updatedBy = req.user._id;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner: {
        id: banner._id,
        badge: banner.badge,
        label: banner.label,
        description: banner.description,
        position: banner.position,
        textTheme: banner.textTheme,
        media: banner.media,
        enableButtons: banner.enableButtons,
        buttons: banner.buttons,
        isActive: banner.isActive,
        order: banner.order,
        updatedAt: banner.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update banner",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Delete Banner ------------------------------------------
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
        description: "Please provide a valid banner ID.",
      });
    }

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
        description: "The requested banner does not exist.",
      });
    }

    if (banner.media?.publicId) {
      try {
        await deleteMedia(banner.media.publicId, banner.media.resourceType);
      } catch (error) {
        console.error("Error deleting banner media:", error);
      }
    }

    const deletedOrder = banner.order;

    await Banner.findByIdAndDelete(id);

    // Shift banners up to close the gap
    await Banner.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } },
    );

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Public Banners ------------------------------------------
export const getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .select("-__v -createdBy -updatedBy")
      .lean();

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("Get public banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
