import express from 'express';
import User from '../models/User.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', authenticate, async (req, res) => {
  try {
    const { documentType, documentFile } = req.body;

    if (!documentType || !documentFile) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        kycStatus: 'pending',
        kycData: {
          documentType,
          documentFile,
          submittedAt: new Date()
        }
      },
      { new: true }
    );

    const io = req.app.get('io');
    io.to('admin_room').emit('kyc_submitted', {
      userId: req.userId,
      username: user.username,
      email: user.email,
      documentType,
      timestamp: new Date()
    });

    res.json({
      message: 'KYC submission received',
      kycStatus: user.kycStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      kycStatus: user.kycStatus,
      kycData: user.kycData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ kycStatus: 'pending' })
      .select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/approve/:userId', authenticate, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { kycStatus: 'verified' },
      { new: true }
    );

    const io = req.app.get('io');
    io.to(`user_${req.params.userId}`).emit('kyc_approved', {
      message: 'Your KYC has been approved!',
      timestamp: new Date()
    });

    res.json({ message: 'KYC approved', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reject/:userId', authenticate, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        kycStatus: 'rejected',
        kycData: {
          documentType: user.kycData?.documentType,
          documentFile: user.kycData?.documentFile,
          submittedAt: user.kycData?.submittedAt,
          rejectionReason: reason
        }
      },
      { new: true }
    );

    const io = req.app.get('io');
    io.to(`user_${req.params.userId}`).emit('kyc_rejected', {
      message: 'Your KYC has been rejected',
      reason,
      timestamp: new Date()
    });

    res.json({ message: 'KYC rejected', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
