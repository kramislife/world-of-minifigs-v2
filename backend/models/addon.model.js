import mongoose from "mongoose";

const addonSchema = new mongoose.Schema(
  {
    addonName: {
      type: String,
      required: true,
      trim: true,
    },
    addonType: {
      type: String,
      enum: ["dealer", "reward"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [
      {
        _id: false,
        itemName: {
          type: String,
          trim: true,
        },
        itemPrice: {
          type: Number,
          min: [0, "Item price cannot be negative"],
        },
        image: {
          publicId: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      },
    ],
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
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

// Indexes

// Fast lookup for active addons of a specific type
addonSchema.index({ addonType: 1, isActive: 1 });

// Sorting by latest
addonSchema.index({ createdAt: -1 });

// Uniqueness within the same type
addonSchema.index(
  { addonName: 1, addonType: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

const Addon = mongoose.model("Addon", addonSchema);

export default Addon;
