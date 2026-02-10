import mongoose from "mongoose";

const rewardAddonSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 month"],
      default: 3,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    features: {
      type: [String],
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

// Fast lookup for active reward addons
rewardAddonSchema.index({ isActive: 1 });

// Sorting by latest
rewardAddonSchema.index({ createdAt: -1 });

// Uniqueness for combination of quantity and duration
rewardAddonSchema.index(
  { quantity: 1, duration: 1 },
  {
    unique: true,
  },
);

const RewardAddon = mongoose.model("RewardAddon", rewardAddonSchema);

export default RewardAddon;
