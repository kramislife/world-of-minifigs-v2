import mongoose from "mongoose";

const subCollectionSchema = new mongoose.Schema(
  {
    subCollectionName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
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

// Indexes

subCollectionSchema.index(
  { collectionId: 1, subCollectionName: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

subCollectionSchema.index({ createdAt: -1 });
subCollectionSchema.index({ isActive: 1 });

const SubCollection = mongoose.model("SubCollection", subCollectionSchema);

export default SubCollection;
