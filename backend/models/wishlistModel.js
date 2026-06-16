import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: "User" 
        },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "Product" 
    },
});


export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);