import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    number: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    appliedCoupons: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
