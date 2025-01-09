import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User'
    },
    review: {
        type: String,
        required: true,
        maxlength: 500 
    },
    rating: {
        type: Number,
        required: true,
        min: 1, 
        max: 5  
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{ timestamps: true }
);


export default mongoose.models.Review || mongoose.model("Review", reviewSchema);