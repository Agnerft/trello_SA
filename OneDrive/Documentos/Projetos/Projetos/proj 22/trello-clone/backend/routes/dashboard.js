const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { startOfDay, endOfDay, subDays } = require('date-fns');

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total boards
    const totalBoards = await prisma.board.count({
      where: { ownerId: userId, isArchived: false }
    });

    // Total cards
    const totalCards = await prisma.card.count({
      where: {
        list: { board: { ownerId: userId } },
        isArchived: false
      }
    });

    // Completed cards (in "Concluído" list)
    const completedCards = await prisma.card.count({
      where: {
        list: {
          board: { ownerId: userId },
          title: { contains: 'Concluído', mode: 'insensitive' }
        },
        isArchived: false
      }
    });

    // Overdue cards
    const overdueCards = await prisma.card.count({
      where: {
        list: { board: { ownerId: userId } },
        dueDate: { lt: new Date() },
        isArchived: false
      }
    });

    // Cards due today
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    
    const dueToday = await prisma.card.count({
      where: {
        list: { board: { ownerId: userId } },
        dueDate: {
          gte: todayStart,
          lte: todayEnd
        },
        isArchived: false
      }
    });

    // High priority cards
    const highPriorityCards = await prisma.card.count({
      where: {
        list: { board: { ownerId: userId } },
        priority: 'high',
        isArchived: false
      }
    });

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        board: { select: { title: true } },
        card: { select: { title: true } }
      }
    });

    // Cards by board
    const cardsByBoard = await prisma.board.findMany({
      where: { ownerId: userId, isArchived: false },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            lists: {
              select: {
                cards: {
                  where: { isArchived: false }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      totalBoards,
      totalCards,
      completedCards,
      overdueCards,
      dueToday,
      highPriorityCards,
      completionRate: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
      recentActivities,
      cardsByBoard
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
