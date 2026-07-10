import mongoose from 'mongoose';

const adminFundTransferSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userWalletAddress: {
    type: String,
    required: true
  },
  cryptocurrency: {
    type: String,
    enum: ['ethereum', 'bitcoin', 'usdtTrc20'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.001
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

export default mongoose.model('AdminFundTransfer', adminFundTransferSchema);
