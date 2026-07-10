import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import AdminFundTransfer from '../models/AdminFundTransfer.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/verify', authenticate, adminOnly, (req, res) => {
  res.json({ message: 'Admin access verified', adminFunds: 'Unlimited' });
});

router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('-password')
      .limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/search/:query', authenticate, adminOnly, async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { _id: query },
        { email: new RegExp(query, 'i') },
        { username: new RegExp(query, 'i') }
      ]
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/transfer-funds', authenticate, adminOnly, async (req, res) => {
  try {
    const { userId, userWalletAddress, cryptocurrency, amount } = req.body;

    if (!userId || !userWalletAddress || !cryptocurrency || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const addressPatterns = {
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      bitcoin: /^bc1[a-z0-9]{39,59}$/,
      usdtTrc20: /^0x[a-fA-F0-9]{40}$/
    };

    if (!addressPatterns[cryptocurrency]?.test(userWalletAddress)) {
      return res.status(400).json({ message: 'Invalid wallet address format for ' + cryptocurrency });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fundTransfer = new AdminFundTransfer({
      adminId: req.userId,
      userId,
      userWalletAddress,
      cryptocurrency,
      amount,
      status: 'completed'
    });

    await fundTransfer.save();

    user.balances[cryptocurrency] = (user.balances[cryptocurrency] || 0) + amount;
    await user.save();

    const transaction = new Transaction({
      userId,
      type: 'deposit',
      cryptocurrency,
      amount,
      fromAddress: 'Admin Transfer',
      toAddress: userWalletAddress,
      status: 'completed',
      description: `Admin fund transfer from admin account`
    });

    await transaction.save();

    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('notification', {
      type: 'fund_received',
      message: `You received ${amount} ${cryptocurrency}`,
      amount,
      cryptocurrency,
      timestamp: new Date()
    });

    res.json({
      message: 'Funds transferred successfully',
      fundTransfer: {
        id: fundTransfer._id,
        userId,
        userWalletAddress,
        cryptocurrency,
        amount,
        status: 'completed',
        timestamp: fundTransfer.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/fund-transfers', authenticate, adminOnly, async (req, res) => {
  try {
    const transfers = await AdminFundTransfer.find()
      .populate('adminId', 'username email')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard-stats', authenticate, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const kycPending = await User.countDocuments({ kycStatus: 'pending' });
    const kycVerified = await User.countDocuments({ kycStatus: 'verified' });
    const totalTransactions = await Transaction.countDocuments();

    res.json({
      totalUsers,
      kycPending,
      kycVerified,
      totalTransactions,
      adminFunds: 'Unlimited'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
