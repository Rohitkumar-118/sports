const express = require('express');
const router = express.Router();
const PlayRequest = require('../models/PlayRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requestReceivedEmail, requestAcceptedEmail } = require('../config/email');

// Helper: create notification
const createNotification = async (userId, type, title, message, link = '', meta = {}) => {
  try {
    await Notification.create({ user: userId, type, title, message, link, meta });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// POST /api/requests - send play request
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, game, venue, message, proposedDate, proposedTime } = req.body;
    if (!receiverId || !game || !venue) {
      return res.status(400).json({ success: false, message: 'Receiver, game and venue are required' });
    }
    const existing = await PlayRequest.findOne({ sender: req.user._id, receiver: receiverId, game, status: 'pending' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Pending request already exists for this game' });
    }
    const request = await PlayRequest.create({
      sender: req.user._id, receiver: receiverId, game, venue,
      message: message || '', proposedDate: proposedDate || '', proposedTime: proposedTime || '',
    });
    await request.populate('sender', 'name avatar email');
    await request.populate('receiver', 'name avatar email');

    // In-app notification for receiver
    await createNotification(
      receiverId,
      'request_received',
      request.sender.name + ' wants to play ' + game + '!',
      'You received a play request for ' + game + ' at ' + venue,
      '/requests',
      { requestId: request._id }
    );

    // Gmail notification for receiver
    if (request.receiver.email) {
      requestReceivedEmail(
        request.receiver.name,
        request.receiver.email,
        request.sender.name,
        game, venue,
        proposedDate || '',
        proposedTime || '',
        message || ''
      );
    }

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// GET /api/requests
router.get('/', protect, async (req, res) => {
  try {
    const received = await PlayRequest.find({ receiver: req.user._id })
      .populate('sender', 'name avatar skillLevel preferredGames location')
      .sort({ createdAt: -1 });
    const sent = await PlayRequest.find({ sender: req.user._id })
      .populate('receiver', 'name avatar skillLevel preferredGames location')
      .sort({ createdAt: -1 });
    res.json({ success: true, received, sent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// PUT /api/requests/:id - accept or decline
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const request = await PlayRequest.findById(req.params.id)
      .populate('sender', 'name avatar email')
      .populate('receiver', 'name avatar email');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already ' + request.status });
    }
    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // In-app notification for sender
      await createNotification(
        request.sender._id,
        'request_accepted',
        request.receiver.name + ' accepted your request!',
        'Your play request for ' + request.game + ' was accepted. Meet at ' + request.venue,
        '/requests',
        { requestId: request._id }
      );
      // Gmail notification for sender
      if (request.sender.email) {
        requestAcceptedEmail(
          request.sender.name,
          request.sender.email,
          request.receiver.name,
          request.game,
          request.venue
        );
      }
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// DELETE /api/requests/:id - cancel
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await PlayRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await request.deleteOne();
    res.json({ success: true, message: 'Cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
