import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/history', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/simulate-withdrawal', authenticate, async (req, res) => {
  try {
    const { cryptocurrency, amount } = req.body;

    const user = await User.findById(req.userId);
    const userBalance = user.balances[cryptocurrency];

    if (!userBalance || userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const gasFeePercentage = 0.03;
    const gasFee = amount * gasFeePercentage;
    const totalAmount = amount + gasFee;

    res.json({
      message: 'Withdrawal simulation',
      amount,
      gasFee,
      totalAmount,
      governmentFee: gasFee * 0.5,
      networkFee: gasFee * 0.5,
      cryptocurrency,
      confirmation: 'Withdrawal requires KYC verification and confirmation'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { cryptocurrency, amount, walletAddress } = req.body;

    const user = await User.findById(req.userId);

    if (user.kycStatus !== 'verified') {
      return res.status(403).json({ message: 'KYC verification required' });
    }

    const userBalance = user.balances[cryptocurrency];
    if (!userBalance || userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const gasFee = amount * 0.03;
    const totalAmount = amount + gasFee;

    const transaction = new Transaction({
      userId: req.userId,
      type: 'withdrawal',
      cryptocurrency,
      amount,
      gasFee,
      totalAmount,
      toAddress: walletAddress,
      status: 'pending'
    });

    await transaction.save();

    user.balances[cryptocurrency] -= totalAmount;
    await user.save();

    res.json({
      message: 'Withdrawal initiated',
      transaction: {
        id: transaction._id,
        status: transaction.status,
        amount,
        gasFee,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
