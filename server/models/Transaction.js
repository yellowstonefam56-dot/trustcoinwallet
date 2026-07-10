import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'internal_transfer'],
    required: true
  },
  cryptocurrency: {
    type: String,
    enum: ['ethereum', 'bitcoin', 'usdtTrc20'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  gasFee: {
    type: Number,
    default: 0
  },
  totalAmount: Number,
  fromAddress: String,
  toAddress: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  txHash: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Transaction', transactionSchema);
