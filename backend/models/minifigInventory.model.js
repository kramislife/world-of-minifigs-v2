import mongoose from "mongoose";

const minifigInventorySchema = new mongoose.Schema(
  {
    minifigName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0.01, "Price must be at least 0.01"],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    image: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

/* ----------------------------- Indexes ----------------------------- */

// Fast lookup + uniqueness for name and color combo
minifigInventorySchema.index(
  { colorId: 1, minifigName: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 }, // Case-insensitive
  },
);

// Search optimization
minifigInventorySchema.index({ minifigName: 1 });
minifigInventorySchema.index({ isActive: 1 });
minifigInventorySchema.index({ createdAt: -1 });

const MinifigInventory = mongoose.model(
  "MinifigInventory",
  minifigInventorySchema,
);

export default MinifigInventory;
