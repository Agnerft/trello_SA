const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get all boards for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        ownerId: req.user.userId,
        isArchived: false
      },
      orderBy: [
        { isFavorite: 'desc' },
        { updatedAt: 'desc' }
      ],
      include: {
        _count: {
          select: { lists: true }
        }
      }
    });

    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get single board with lists and cards
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                labels: true,
                assignee: {
                  select: { id: true, name: true, avatar: true }
                },
                _count: {
                  select: { 
                    comments: true,
                    attachments: true,
                    checklists: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create board
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, coverColor, coverImage } = req.body;

  try {
    const board = await prisma.board.create({
      data: {
        title,
        description,
        coverColor,
        coverImage,
        ownerId: req.user.userId
      }
    });

    // Create default lists
    await prisma.list.createMany({
      data: [
        { title: 'A Fazer', position: 0, boardId: board.id },
        { title: 'Em Andamento', position: 1, boardId: board.id },
        { title: 'Concluído', position: 2, boardId: board.id }
      ]
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, coverColor, coverImage, isFavorite } = req.body;

  try {
    const board = await prisma.board.updateMany({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      },
      data: {
        title,
        description,
        coverColor,
        coverImage,
        isFavorite
      }
    });

    if (board.count === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json({ message: 'Board updated' });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete board
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.board.deleteMany({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      }
    });

    res.json({ message: 'Board deleted' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await prisma.board.update({
      where: { id: req.params.id },
      data: { isFavorite: !board.isFavorite }
    });

    res.json({ isFavorite: !board.isFavorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

module.exports = router;
