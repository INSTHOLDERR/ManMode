import mongoose from "mongoose";


const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      amount: { type: Number, required: true },
      type: { type: String, enum: ['credit', 'debit'], required: true },
      paymentId: { type: String },
      date: { type: Date, default: Date.now },
    }
  ]
});

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);