
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    size: { type: String, required: true },
    count: { type: Number, default: 1, required: true },
    totalCount: { type: Number, default: 1 }, 
    actualPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    normalActualPrice: { type: Number},
    normalTotalPrice: { type: Number}, 
});


export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);