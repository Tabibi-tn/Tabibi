const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Message, User } = require('../models');

// send a message
router.post('/', auth, async (req, res) => {
  const { receiverId, content, appointmentId } = req.body;
  if (!receiverId || !content) return res.status(400).json({ message: 'receiverId and content required' });
  const msg = await Message.create({ senderId: req.user.id, receiverId, content, appointmentId });
  res.status(201).json(msg);
});

// get conversation between current user and another user
router.get('/conversation/:userId', auth, async (req, res) => {
  const otherId = parseInt(req.params.userId, 10);
  const msgs = await Message.findAll({
    where: {
      // (sender = me AND receiver = other) OR (sender = other AND receiver = me)
    },
    order: [['createdAt','ASC']]
  });
  // fallback simple query using raw SQL if necessary
  const sql = `SELECT * FROM Messages WHERE (senderId = :me AND receiverId = :other) OR (senderId = :other AND receiverId = :me) ORDER BY createdAt ASC`;
  const results = await Message.sequelize.query(sql, { replacements: { me: req.user.id, other: otherId }, type: Message.sequelize.QueryTypes.SELECT });
  res.json(results);
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
