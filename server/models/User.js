import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  profileImage: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  walletAddresses: {
    ethereum: {
      type: String,
      default: '0x505917f33e13642996068cdb135754c9d96811b9'
    },
    bitcoin: {
      type: String,
      default: 'bc1q3sckm34082natadrqxqdguev32707pcal5ea53'
    },
    usdtTrc20: {
      type: String,
      default: '0x505917f33e13642996068cdb135754c9d96811b9'
    }
  },
  balances: {
    ethereum: {
      type: Number,
      default: 0
    },
    bitcoin: {
      type: Number,
      default: 0
    },
    usdtTrc20: {
      type: Number,
      default: 0
    }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  kycData: {
    documentType: String,
    documentFile: String,
    submittedAt: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  externalWallets: [{
    address: String,
    chain: String,
    connectedAt: Date
  }],
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
