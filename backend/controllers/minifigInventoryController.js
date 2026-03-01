import MinifigInventory from "../models/minifigInventory.model.js";
import Color from "../models/color.model.js";
import {
  uploadImage,
  deleteImage,
  validateImage,
} from "../utils/cloudinary.js";
import {
  normalizePagination,
  buildSearchQuery,
  paginateQuery,
  createPaginationResponse,
} from "../utils/pagination.js";
import { checkNameConflict } from "../utils/commonUtils.js";
import { AUDIT_POPULATE } from "../utils/populateHelpers.js";

//------------------------------------------------ Create Minifig Inventory (Bulk) ------------------------------------------
export const createMinifigInventoryBulk = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No items provided",
      description: "Please provide an array of inventory items to upload.",
    });
  }

  const results = {
    saved: [],
    failed: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowId = item.rowId || i;

    try {
      const { minifigName, price, stock, colorId, image } = item;

      // Validate required fields
      if (!minifigName || !String(minifigName).trim())
        throw new Error("Minifig name is required");
      if (!price || Number(price) <= 0)
        throw new Error("Price must be greater than zero");
      if (
        stock === undefined ||
        stock === null ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
      ) {
        throw new Error("Stock must be a non-negative integer");
      }
      if (!colorId) throw new Error("Color is required");
      if (!image) throw new Error("Image is required");

      // Verify color exists
      const color = await Color.findById(colorId);
      if (!color) throw new Error("Selected color does not exist");

      // Validate image
      const imgValidation = validateImage(image);
      if (!imgValidation.isValid) throw new Error(imgValidation.error);

      // Check for duplicate name + color combo (Non-blocking warning for bulk)
      const existing = await checkNameConflict(
        MinifigInventory,
        "minifigName",
        String(minifigName).trim(),
        null,
        { colorId },
      );
      const warning = existing
        ? `Item with name "${minifigName}" and color "${color.colorName}" already exists.`
        : null;

      // Upload image to Cloudinary
      const uploadResult = await uploadImage(
        image,
        "world-of-minifigs-v2/minifig-inventory",
      );

      const newInventory = await MinifigInventory.create({
        minifigName: String(minifigName).trim(),
        price: Number(price),
        stock: Number(stock),
        colorId,
        image: {
          publicId: uploadResult.public_id,
          url: uploadResult.url,
        },
        createdBy: req.user._id,
      });

      results.saved.push({
        rowId,
        id: newInventory._id,
        minifigName: newInventory.minifigName,
        warning,
      });
    } catch (error) {
      results.failed.push({
        rowId,
        name: item.minifigName || item.name || `Row ${i + 1}`,
        reason: error.message,
      });
    }
  }

  const totalSaved = results.saved.length;
  const totalFailed = results.failed.length;

  return res.status(200).json({
    success: true,
    message: `Minifig completed: ${totalSaved} saved, ${totalFailed} failed.`,
    summary: {
      totalSaved,
      totalFailed,
    },
    results,
  });
};

//------------------------------------------------ Get All Minifig Inventory ------------------------------------------
export const getAllMinifigInventory = async (req, res) => {
  try {
    const { page, limit, search, isActive } = normalizePagination(req.query);

    let searchQuery = {};
    if (search) {
      // Search in minifig specific fields
      const inventorySearchFields = ["minifigName"];
      const inventoryQuery = buildSearchQuery(search, inventorySearchFields);

      // Search via linked color fields
      const colorSearchFields = ["colorName", "hexCode"];
      const colorSearchQuery = buildSearchQuery(search, colorSearchFields);
      const matchingColors = await Color.find(colorSearchQuery)
        .select("_id")
        .lean();
      const matchingColorIds = matchingColors.map((c) => c._id);

      searchQuery = { $or: [inventoryQuery] };

      if (matchingColorIds.length > 0) {
        searchQuery.$or.push({ colorId: { $in: matchingColorIds } });
      }

      // Numeric search for stock
      const searchNum = Number(search);
      if (!isNaN(searchNum)) {
        searchQuery.$or.push({ stock: searchNum });
      }
    }

    const query = { ...searchQuery };

    if (isActive !== undefined) {
      query.isActive = isActive === "true" || isActive === true;
    }

    const result = await paginateQuery(MinifigInventory, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "colorId", select: "colorName hexCode" },
        ...AUDIT_POPULATE,
      ],
    });

    return res.status(200).json(createPaginationResponse(result, "inventory"));
  } catch (error) {
    console.error("Get all inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Get Single Minifig Inventory ------------------------------------------
export const getMinifigInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await MinifigInventory.findById(id)
      .select("-__v")
      .populate("colorId", "colorName hexCode")
      .populate("createdBy", "firstName lastName username")
      .populate("updatedBy", "firstName lastName username")
      .lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
        description: "The requested inventory item does not exist.",
      });
    }

    return res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("Get inventory by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Update Minifig Inventory ------------------------------------------
export const updateMinifigInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { minifigName, price, stock, colorId, image, isActive } = req.body;

    const inventory = await MinifigInventory.findById(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
        description: "The requested inventory item does not exist.",
      });
    }

    // Update name with uniqueness check
    if (minifigName !== undefined) {
      if (!minifigName || !String(minifigName).trim()) {
        return res.status(400).json({
          success: false,
          message: "Minifig name is required",
          description: "Please provide a valid name.",
        });
      }

      const checkName = String(minifigName).trim();
      const checkColorId = colorId || inventory.colorId;

      if (
        checkName !== inventory.minifigName ||
        (colorId && colorId !== inventory.colorId.toString())
      ) {
        const existing = await checkNameConflict(
          MinifigInventory,
          "minifigName",
          checkName,
          id,
          { colorId: checkColorId },
        );

        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Duplicate item",
            description: "An item with this name and color already exists.",
          });
        }
      }
      inventory.minifigName = checkName;
    }

    if (price !== undefined) {
      if (Number(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than zero",
          description: "Please provide a valid positive price.",
        });
      }
      inventory.price = Number(price);
    }

    if (stock !== undefined) {
      if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be an integer >= 0",
          description: "Please provide a valid non-negative integer for stock.",
        });
      }
      inventory.stock = Number(stock);
    }

    if (colorId !== undefined) {
      const color = await Color.findById(colorId);
      if (!color) {
        return res.status(404).json({
          success: false,
          message: "Color not found",
          description: "The selected color does not exist.",
        });
      }
      inventory.colorId = colorId;
    }

    if (image !== undefined && image !== null) {
      if (typeof image === "string" && image.startsWith("data:image/")) {
        const imgValidation = validateImage(image);
        if (!imgValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: imgValidation.error,
          });
        }

        if (inventory.image?.publicId) {
          try {
            await deleteImage(inventory.image.publicId);
          } catch (err) {
            console.error("Old image deletion failed:", err);
          }
        }

        const uploadResult = await uploadImage(
          image,
          "world-of-minifigs-v2/minifig-inventory",
        );
        inventory.image = {
          publicId: uploadResult.public_id,
          url: uploadResult.url,
        };
      }
    }

    if (isActive !== undefined) {
      inventory.isActive = Boolean(isActive);
    }

    inventory.updatedBy = req.user._id;
    await inventory.save();

    await inventory.populate({ path: "colorId", select: "colorName hexCode" });

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};

//------------------------------------------------ Delete Minifig Inventory ------------------------------------------
export const deleteMinifigInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await MinifigInventory.findById(id).lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
        description: "The requested inventory item does not exist.",
      });
    }

    if (inventory.image?.publicId) {
      try {
        await deleteImage(inventory.image.publicId);
      } catch (err) {
        console.error("Image deletion failed:", err);
      }
    }

    await MinifigInventory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
