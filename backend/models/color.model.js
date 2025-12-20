import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    colorName: {
      type: String,
      required: [true, "Color name is required"],
      trim: true,
      unique: true,
    },
    hexCode: {
      type: String,
      required: [true, "Hex code is required"],
      trim: true,
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
  }
);

const Color = mongoose.model("Color", colorSchema);

export default Color;

