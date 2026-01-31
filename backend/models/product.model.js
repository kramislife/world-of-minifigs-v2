import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      enum: ["standalone", "variant"],
      required: true,
      default: "standalone",
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    partId: {
      type: String,
      trim: true,
    },
    itemId: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price must be a positive number"],
    },
    descriptions: {
      type: [String],
      required: [true, "At least one description is required"],
    },
    images: {
      type: [
        {
          _id: false,
          publicId: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      default: undefined,
    },
    // Variants
    variants: {
      type: [
        {
          _id: false,
          colorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Color",
            required: true,
          },
          secondaryColorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Color",
          },
          itemId: {
            type: String,
            required: true,
            trim: true,
          },
          stock: {
            type: Number,
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
        },
      ],
      default: undefined,
    },
    categoryIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
    },
    subCategoryIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SubCategory",
    },
    collectionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Collection",
    },
    subCollectionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SubCollection",
    },
    skillLevelIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "SkillLevel",
    },
    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
    },
    secondaryColorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
    },
    pieceCount: {
      type: Number,
      min: [0, "Piece count must be a positive number"],
    },
    length: {
      type: Number,
      min: [0, "Length must be a positive number"],
    },
    width: {
      type: Number,
      min: [0, "Width must be a positive number"],
    },
    height: {
      type: Number,
      min: [0, "Height must be a positive number"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
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

// Fast lookup + uniqueness guarantee for standalone products
productSchema.index(
  { partId: 1, itemId: 1 },
  {
    unique: true,
    sparse: true, // Only index documents where partId and itemId exist
    collation: { locale: "en", strength: 2 }, // case-insensitive
  },
);

// Filtering indexes
productSchema.index({ productType: 1 });
productSchema.index({ categoryIds: 1 });
productSchema.index({ subCategoryIds: 1 });
productSchema.index({ colorId: 1 });
productSchema.index({ secondaryColorId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ categoryIds: 1, isActive: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ productType: 1, isActive: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
