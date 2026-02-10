import mongoose from "mongoose";

const dealerExtraBagSchema = new mongoose.Schema(
  {
    subCollectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCollection",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
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

// Fast lookup + uniqueness guarantee per sub-collection type
dealerExtraBagSchema.index({ isActive: 1 });
dealerExtraBagSchema.index({ createdAt: -1 });

const DealerExtraBag = mongoose.model("DealerExtraBag", dealerExtraBagSchema);

export default DealerExtraBag;
