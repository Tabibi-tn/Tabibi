const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Message, User } = require('../models');

// send a message
router.post('/', auth, async (req, res, next) => {
  try {
    const { receiverId, content, appointmentId } = req.body;
    if (!receiverId || !content) return res.status(400).json({ message: 'receiverId and content required' });
    const msg = await Message.create({ senderId: req.user.id, receiverId, content, appointmentId });
    res.status(201).json(msg);
  } catch (err) { next(err); }
});

// get conversation between current user and another user
router.get('/conversation/:userId', auth, async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const otherId = parseInt(req.params.userId, 10);
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: otherId },
          { senderId: otherId, receiverId: req.user.id }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) { next(err); }
});

// Get all conversations for the logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sql = `
      SELECT DISTINCT 
        CASE 
          WHEN senderId = :userId THEN receiverId 
          ELSE senderId 
        END as otherUserId
      FROM Messages 
      WHERE senderId = :userId OR receiverId = :userId
    `;
    
    const results = await Message.sequelize.query(sql, { 
      replacements: { userId },
      type: Message.sequelize.QueryTypes.SELECT
    });
    
    const conversations = await Promise.all(results.map(async (r) => {
      const otherUserId = r.otherUserId;
      
      const lastMessageSql = `
        SELECT content, createdAt FROM Messages 
        WHERE (senderId = :userId AND receiverId = :otherId) 
           OR (senderId = :otherId AND receiverId = :userId)
        ORDER BY createdAt DESC LIMIT 1
      `;
      
      const lastMsg = await Message.sequelize.query(lastMessageSql, {
        replacements: { userId, otherId: otherUserId },
        type: Message.sequelize.QueryTypes.SELECT
      });
      
      const user = await User.findByPk(otherUserId);
      
      return {
        id: otherUserId,
        otherUserId,
        name: user?.name || 'Unknown User',
        lastMessage: lastMsg[0]?.content || null,
        lastMessageAt: lastMsg[0]?.createdAt || null
      };
    }));
    
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    
    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
