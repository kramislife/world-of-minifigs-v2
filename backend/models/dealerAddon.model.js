import mongoose from "mongoose";

const dealerAddonSchema = new mongoose.Schema(
  {
    addonName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
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
        color: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
      },
    ],
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

// Fast lookup for active dealer addons
dealerAddonSchema.index({ isActive: 1 });

// Sorting by latest
dealerAddonSchema.index({ createdAt: -1 });

// Uniqueness for addon name
dealerAddonSchema.index(
  { addonName: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

const DealerAddon = mongoose.model("DealerAddon", dealerAddonSchema);

export default DealerAddon;
