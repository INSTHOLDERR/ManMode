import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true
  },
  },
  { timestamps: true }
);
export default mongoose.models.Brand || mongoose.model("Brand", brandSchema);
