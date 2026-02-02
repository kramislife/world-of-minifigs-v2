import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    badge: {
      type: String,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    position: {
      type: String,
      enum: ["center", "bottom-left", "bottom-right"],
      required: true,
      default: "center",
    },
    textTheme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    media: {
      _id: false,
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      resourceType: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      duration: {
        type: Number,
        min: [0, "Duration must be a positive number"],
      },
    },

    enableButtons: {
      type: Boolean,
      default: false,
    },

    buttons: {
      type: [
        {
          _id: false,
          label: {
            type: String,
            required: true,
            trim: true,
          },
          href: {
            type: String,
            required: true,
            trim: true,
          },
          variant: {
            type: String,
            enum: ["default", "outline"],
            default: "default",
          },
        },
      ],
      default: undefined,
    },   
    order: {
      type: Number,
      default: 0,
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

bannerSchema.index({ isActive: 1, order: 1 });
bannerSchema.index({ order: 1 });
bannerSchema.index({ isActive: 1, createdAt: -1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
