import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        basePrice: { type: Number, required: true },
        stock: { type: Number, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
        sizes: { type: Map, of: Number, default: {} },
        images: { type: [String], required: true },
        isActive: { type: Boolean, default: true },
        averageRating: { type: Number, default: 0 }, 
        offerPrice: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
