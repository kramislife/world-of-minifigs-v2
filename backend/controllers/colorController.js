import Color from "../models/color.model.js";

//------------------------------------------------ Create Color ------------------------------------------
export const createColor = async (req, res) => {
  try {
    const { colorName, hexCode } = req.body;

    // Validate required fields
    if (!colorName) {
      return res.status(400).json({
        success: false,
        message: "Color name is required",
        description: "Please provide a color name.",
      });
    }

    if (!hexCode) {
      return res.status(400).json({
        success: false,
        message: "Hex code is required",
        description: "Please provide a hex color code.",
      });
    }

    // Normalize color name
    const colorNameStr = String(colorName).trim();

    if (!colorNameStr) {
      return res.status(400).json({
        success: false,
        message: "Color name cannot be empty",
        description: "Please provide a valid color name.",
      });
    }

    // Check if color with same name already exists
    const existingColor = await Color.findOne({
      colorName: colorNameStr,
    });

    if (existingColor) {
      return res.status(409).json({
        success: false,
        message: "Color already exists",
        description: "A color with this name already exists.",
      });
    }

    // Validate hex code format
    const hexCodeStr = String(hexCode).trim().toUpperCase();
    // Validate hex code format (#RRGGBB or RRGGBB)
    const hexPattern = /^#?[0-9A-F]{6}$/i;
    if (!hexPattern.test(hexCodeStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hex code format",
        description:
          "Hex code must be in format #RRGGBB or RRGGBB (e.g., #FF5733 or FF5733).",
      });
    }
    // Ensure it starts with #
    const normalizedHexCode = hexCodeStr.startsWith("#")
      ? hexCodeStr
      : `#${hexCodeStr}`;

    // Create color
    const color = await Color.create({
      colorName: colorNameStr,
      hexCode: normalizedHexCode,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Color created successfully",
      color: {
        id: color._id,
        colorName: color.colorName,
        hexCode: color.hexCode,
        createdAt: color.createdAt,
      },
    });
  } catch (error) {
    console.error("Create color error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create color",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get All Colors ------------------------------------------
export const getAllColors = async (req, res) => {
  try {
    const colors = await Color.find()
      .select("-__v")
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: colors.length,
      colors,
    });
  } catch (error) {
    console.error("Get all colors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch colors",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get Single Color ------------------------------------------
export const getColorById = async (req, res) => {
  try {
    const { id } = req.params;

    const color = await Color.findById(id)
      .select("-__v")
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username");

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
        description: "The requested color does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      color,
    });
  } catch (error) {
    console.error("Get color by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch color",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Update Color ------------------------------------------
export const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { colorName, hexCode } = req.body;

    const color = await Color.findById(id);

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
        description: "The requested color does not exist.",
      });
    }

    // Update color name if provided
    if (colorName !== undefined) {
      const colorNameStr = String(colorName).trim();

      if (!colorNameStr) {
        return res.status(400).json({
          success: false,
          message: "Color name cannot be empty",
          description: "Please provide a valid color name.",
        });
      }

      // Check if another color with same name exists
      const existingColor = await Color.findOne({
        colorName: colorNameStr,
        _id: { $ne: id },
      });

      if (existingColor) {
        return res.status(409).json({
          success: false,
          message: "Color name already exists",
          description: "Another color with this name already exists.",
        });
      }

      color.colorName = colorNameStr;
    }

    // Update hex code if provided
    if (hexCode !== undefined) {
      if (!hexCode || hexCode.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Hex code is required",
          description: "Please provide a hex color code.",
        });
      }

      const hexCodeStr = String(hexCode).trim().toUpperCase();
      const hexPattern = /^#?[0-9A-F]{6}$/i;
      if (!hexPattern.test(hexCodeStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hex code format",
          description:
            "Hex code must be in format #RRGGBB or RRGGBB (e.g., #FF5733 or FF5733).",
        });
      }
      color.hexCode = hexCodeStr.startsWith("#")
        ? hexCodeStr
        : `#${hexCodeStr}`;
    }

    // Update updatedBy
    color.updatedBy = req.user._id;

    await color.save();

    return res.status(200).json({
      success: true,
      message: "Color updated successfully",
      color: {
        id: color._id,
        colorName: color.colorName,
        hexCode: color.hexCode,
        updatedAt: color.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update color error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update color",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Delete Color ------------------------------------------
export const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;

    const color = await Color.findById(id);

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
        description: "The requested color does not exist.",
      });
    }

    await Color.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Color deleted successfully",
    });
  } catch (error) {
    console.error("Delete color error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete color",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
