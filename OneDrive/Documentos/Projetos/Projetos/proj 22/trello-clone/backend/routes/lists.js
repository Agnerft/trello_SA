const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Create list
router.post('/', authenticateToken, async (req, res) => {
  const { title, boardId } = req.body;

  try {
    // Verify board ownership
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: req.user.userId
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Get max position
    const maxPosition = await prisma.list.aggregate({
      where: { boardId },
      _max: { position: true }
    });

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        position: (maxPosition._max.position ?? -1) + 1
      }
    });

    res.status(201).json(list);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.put('/:id', authenticateToken, async (req, res) => {
  const { title } = req.body;

  try {
    const list = await prisma.list.findFirst({
      where: { id: req.params.id },
      include: { board: true }
    });

    if (!list || list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'List not found' });
    }

    await prisma.list.update({
      where: { id: req.params.id },
      data: { title }
    });

    res.json({ message: 'List updated' });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const list = await prisma.list.findFirst({
      where: { id: req.params.id },
      include: { board: true }
    });

    if (!list || list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'List not found' });
    }

    await prisma.list.delete({ where: { id: req.params.id } });

    res.json({ message: 'List deleted' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Reorder lists
router.post('/reorder', authenticateToken, async (req, res) => {
  const { items } = req.body;

  try {
    await prisma.$transaction(
      items.map((item, index) =>
        prisma.list.update({
          where: { id: item.id },
          data: { position: index }
        })
      )
    );

    res.json({ message: 'Lists reordered' });
  } catch (error) {
    console.error('Reorder lists error:', error);
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
});

module.exports = router;
