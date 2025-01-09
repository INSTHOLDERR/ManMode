import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        uppercase: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentageDiscount', 'flatDiscount'],
        required: true
    },
    minimumPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0
    },
    maxRedeem: {
        type: Number,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
});

couponSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
