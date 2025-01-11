import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  zipCode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  altPhone: { type: String },
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
  size: { type: String, required: true },
  count: { type: Number, required: true },
  actualPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  normalActualPrice: { type: Number},
    normalTotalPrice: { type: Number}, 
    itemdiscount: { type: Number},
    totalDiscount: { type: Number}, 
  status: {
    type: String,
    enum: [
      "Payment Pending",
      "Order Confirmed",
      "In Progress",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ],
    default: "Order Confirmed",
  },
  returnStatus: {
    type: String,
    enum: ['NotRequested', 'Requested', 'Approved', 'Rejected'],
    default: 'NotRequested',
  },
  returnReason: {
    type: String,
    required: false,
  },
  returnRequestedAt: {
    type: Date,
    required: false,
  },
  cancelReason: {
    type: String,
    required: false,
  }
},{ timestamps: true });

const userOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  addresses: [addressSchema], 
  orderedItems: [cartItemSchema], 
  paymentMethod: {
    type: String,
    enum: ["COD", "Razorpay", "Wallet"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Success", "Failed"],
  },
  actualTotalAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  discount:{ type: Number},
  shippingFee: { type: Number }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserOrder || mongoose.model("UserOrder", userOrderSchema);
