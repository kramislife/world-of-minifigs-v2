import SkillLevel from "../models/skillLevel.model.js";
import {
  normalizePagination,
  buildSearchQuery,
  paginateQuery,
  createPaginationResponse,
} from "../utils/pagination.js";

//------------------------------------------------ Create SkillLevel ------------------------------------------
export const createSkillLevel = async (req, res) => {
  try {
    const { skillLevelName, description } = req.body;

    // Validate required fields
    if (!skillLevelName) {
      return res.status(400).json({
        success: false,
        message: "Skill level name is required",
        description: "Please provide a skill level name.",
      });
    }

    // Normalize skill level name
    const skillLevelNameStr = String(skillLevelName).trim();

    if (!skillLevelNameStr) {
      return res.status(400).json({
        success: false,
        message: "Skill level name cannot be empty",
        description: "Please provide a valid skill level name.",
      });
    }

    // Check if skill level with same name already exists
    const existingSkillLevel = await SkillLevel.findOne({
      skillLevelName: skillLevelNameStr,
    })
      .collation({ locale: "en", strength: 2 })
      .lean();

    if (existingSkillLevel) {
      return res.status(409).json({
        success: false,
        message: "Skill level already exists",
        description: "A skill level with this name already exists.",
      });
    }

    // Normalize description if provided
    const descriptionStr = description ? String(description).trim() : "";

    // Create skill level
    const skillLevel = await SkillLevel.create({
      skillLevelName: skillLevelNameStr,
      description: descriptionStr,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Skill level created successfully",
      skillLevel: {
        id: skillLevel._id,
        skillLevelName: skillLevel.skillLevelName,
        description: skillLevel.description,
        createdAt: skillLevel.createdAt,
      },
    });
  } catch (error) {
    console.error("Create skill level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create skill level",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get All SkillLevels ------------------------------------------
export const getAllSkillLevels = async (req, res) => {
  try {
    // Extract and normalize pagination parameters
    const { page, limit, search } = normalizePagination({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });

    // Build search query
    const searchFields = ["skillLevelName", "description"];
    const searchQuery = buildSearchQuery(search, searchFields);

    // Apply pagination
    const result = await paginateQuery(SkillLevel, searchQuery, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "createdBy", select: "firstName lastName username" },
        { path: "updatedBy", select: "firstName lastName username" },
      ],
    });

    return res.status(200).json(
      createPaginationResponse(result, "skillLevels")
    );
  } catch (error) {
    console.error("Get all skill levels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skill levels",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get Single SkillLevel ------------------------------------------
export const getSkillLevelById = async (req, res) => {
  try {
    const { id } = req.params;

    const skillLevel = await SkillLevel.findById(id)
      .select("-__v")
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username")
      .lean();

    if (!skillLevel) {
      return res.status(404).json({
        success: false,
        message: "Skill level not found",
        description: "The requested skill level does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      skillLevel,
    });
  } catch (error) {
    console.error("Get skill level by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skill level",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Update SkillLevel ------------------------------------------
export const updateSkillLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { skillLevelName, description } = req.body;

    const skillLevel = await SkillLevel.findById(id);

    if (!skillLevel) {
      return res.status(404).json({
        success: false,
        message: "Skill level not found",
        description: "The requested skill level does not exist.",
      });
    }

    // Update skill level name if provided
    if (skillLevelName !== undefined) {
      const skillLevelNameStr = String(skillLevelName).trim();

      if (!skillLevelNameStr) {
        return res.status(400).json({
          success: false,
          message: "Skill level name cannot be empty",
          description: "Please provide a valid skill level name.",
        });
      }

      // Check if another skill level with same name exists
      const existingSkillLevel = await SkillLevel.findOne({
        skillLevelName: skillLevelNameStr,
        _id: { $ne: id },
      })
        .collation({ locale: "en", strength: 2 })
        .lean();

      if (existingSkillLevel) {
        return res.status(409).json({
          success: false,
          message: "Skill level name already exists",
          description: "Another skill level with this name already exists.",
        });
      }

      skillLevel.skillLevelName = skillLevelNameStr;
    }

    // Update description if provided
    if (description !== undefined) {
      skillLevel.description = description ? String(description).trim() : "";
    }

    // Update updatedBy
    skillLevel.updatedBy = req.user._id;

    await skillLevel.save();

    return res.status(200).json({
      success: true,
      message: "Skill level updated successfully",
      skillLevel: {
        id: skillLevel._id,
        skillLevelName: skillLevel.skillLevelName,
        description: skillLevel.description,
        updatedAt: skillLevel.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update skill level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update skill level",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Delete SkillLevel ------------------------------------------
export const deleteSkillLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const skillLevel = await SkillLevel.findById(id).lean();

    if (!skillLevel) {
      return res.status(404).json({
        success: false,
        message: "Skill level not found",
        description: "The requested skill level does not exist.",
      });
    }

    await SkillLevel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Skill level deleted successfully",
    });
  } catch (error) {
    console.error("Delete skill level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete skill level",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
