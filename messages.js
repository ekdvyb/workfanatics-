const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('username displayName isOnline lastSeen');
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get messages between two users
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.query.currentUser;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username displayName')
    .populate('receiver', 'username displayName')
    .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    const message = await Message.create({
      sender,
      receiver,
      content
    });

    await message.populate('sender', 'username displayName');
    await message.populate('receiver', 'username displayName');

    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;
