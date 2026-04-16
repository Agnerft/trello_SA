const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  const { name, avatar } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, avatar },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
