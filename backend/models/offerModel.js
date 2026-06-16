import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    offerName: {
        type: String,
        required: true,
        trim: true,
    },
    discount: {
        type: Number,
        required: true,
        min: [0, 'Discount cannot be less than 0'],
        validate: {
            validator: function (value) {
                if (this.discountType === 'percentage' && value > 100) {
                    return false; 
                }
                return true;
            },
            message: 'Percentage discount cannot exceed 100',
        },
    },
    discountType: {
        type: String,
        enum: ['flat', 'percentage'],
        required: true,
    },
    offerType: {
        type: String,
        enum: ['brand', 'category'],
        required: true,
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: function () {
            return this.offerType === 'brand';
        },
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: function () {
            return this.offerType === 'category';
        },
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return this.endDate ? value <= this.endDate : true;
            },
            message: 'Start date cannot be after end date',
        },
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.models.Offer || mongoose.model('Offer', offerSchema);
