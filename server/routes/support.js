import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/create-ticket', authenticate, async (req, res) => {
  try {
    const { subject, category, description, attachments } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ticketId = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const ticket = new SupportTicket({
      ticketId,
      userId: req.userId,
      subject,
      category,
      description,
      attachments: attachments || [],
      messages: [{
        senderType: 'user',
        senderName: 'User',
        message: description,
        timestamp: new Date()
      }]
    });

    await ticket.save();

    const io = req.app.get('io');
    io.to('admin_room').emit('new_support_ticket', {
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      category: ticket.category,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'Support ticket created',
      ticket: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        id: ticket._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-tickets', authenticate, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/ticket/:ticketId', authenticate, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.userId.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/ticket/:ticketId/message', authenticate, async (req, res) => {
  try {
    const { message } = req.body;

    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const senderType = req.isAdmin ? 'admin' : 'user';

    ticket.messages.push({
      senderType,
      senderName: senderType === 'admin' ? 'Support Admin' : 'You',
      message,
      timestamp: new Date()
    });

    await ticket.save();

    const io = req.app.get('io');
    if (senderType === 'admin') {
      io.to(`user_${ticket.userId}`).emit('ticket_message', {
        ticketId: ticket.ticketId,
        message,
        from: 'Admin'
      });
    } else {
      io.to('admin_room').emit('ticket_message', {
        ticketId: ticket.ticketId,
        message,
        from: 'User'
      });
    }

    res.json({ message: 'Message added', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all-tickets', authenticate, adminOnly, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/ticket/:ticketId/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.ticketId,
      { status },
      { new: true }
    );

    res.json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
