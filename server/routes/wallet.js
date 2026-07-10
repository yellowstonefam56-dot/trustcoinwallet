import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user_id: user._id,
      walletAddresses: user.walletAddresses,
      balances: user.balances,
      kycStatus: user.kycStatus,
      totalValue: Object.values(user.balances).reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/connect-external', authenticate, async (req, res) => {
  try {
    const { address, chain } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          externalWallets: {
            address,
            chain,
            connectedAt: new Date()
          }
        }
      },
      { new: true }
    );

    res.json({
      message: 'Wallet connected successfully',
      externalWallets: user.externalWallets
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/external-wallets', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user.externalWallets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
