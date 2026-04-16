const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get single card
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: {
        list: { include: { board: true } },
        labels: true,
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        checklists: {
          include: { items: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Create card
router.post('/', authenticateToken, async (req, res) => {
  const { title, listId } = req.body;

  try {
    const list = await prisma.list.findFirst({
      where: { id: listId },
      include: { board: true }
    });

    if (!list || list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'List not found' });
    }

    const maxPosition = await prisma.card.aggregate({
      where: { listId },
      _max: { position: true }
    });

    const card = await prisma.card.create({
      data: {
        title,
        listId,
        position: (maxPosition._max.position ?? -1) + 1
      },
      include: {
        labels: true,
        assignee: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update card
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, dueDate, priority, assigneeId, coverColor } = req.body;

  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: { list: { include: { board: true } } }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const updatedCard = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        assigneeId,
        coverColor
      },
      include: {
        labels: true,
        assignee: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Move card to different list
router.patch('/:id/move', authenticateToken, async (req, res) => {
  const { listId, position } = req.body;

  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: { list: { include: { board: true } } }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await prisma.card.update({
      where: { id: req.params.id },
      data: { listId, position }
    });

    res.json({ message: 'Card moved' });
  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ error: 'Failed to move card' });
  }
});

// Reorder cards within list
router.post('/reorder', authenticateToken, async (req, res) => {
  const { items } = req.body;

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.card.update({
          where: { id: item.id },
          data: { position: item.position, listId: item.listId }
        })
      )
    );

    res.json({ message: 'Cards reordered' });
  } catch (error) {
    console.error('Reorder cards error:', error);
    res.status(500).json({ error: 'Failed to reorder cards' });
  }
});

// Delete card
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: { list: { include: { board: true } } }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await prisma.card.delete({ where: { id: req.params.id } });

    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Archive card
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: { list: { include: { board: true } } }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await prisma.card.update({
      where: { id: req.params.id },
      data: { isArchived: !card.isArchived }
    });

    res.json({ isArchived: !card.isArchived });
  } catch (error) {
    console.error('Archive card error:', error);
    res.status(500).json({ error: 'Failed to archive card' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const { text } = req.body;

  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: { list: { include: { board: true } } }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        cardId: req.params.id,
        authorId: req.user.userId
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Add checklist
router.post('/:id/checklists', authenticateToken, async (req, res) => {
  const { title, items } = req.body;

  try {
    const card = await prisma.card.findFirst({
      where: { id: req.params.id },
      include: { list: { include: { board: true } } }
    });

    if (!card || card.list.board.ownerId !== req.user.userId) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const checklist = await prisma.checklist.create({
      data: {
        title,
        cardId: req.params.id,
        items: {
          create: items?.map(text => ({ text })) || []
        }
      },
      include: { items: true }
    });

    res.status(201).json(checklist);
  } catch (error) {
    console.error('Add checklist error:', error);
    res.status(500).json({ error: 'Failed to add checklist' });
  }
});

// Toggle checklist item
router.patch('/checklist-items/:id', authenticateToken, async (req, res) => {
  const { completed } = req.body;

  try {
    await prisma.checklistItem.update({
      where: { id: req.params.id },
      data: { completed }
    });

    res.json({ message: 'Checklist item updated' });
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

// Search cards
router.get('/search/:query', authenticateToken, async (req, res) => {
  const { query } = req.params;

  try {
    const cards = await prisma.card.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
        list: {
          board: {
            ownerId: req.user.userId
          }
        }
      },
      include: {
        list: {
          select: { title: true, board: { select: { title: true } } }
        },
        labels: true
      },
      take: 20
    });

    res.json(cards);
  } catch (error) {
    console.error('Search cards error:', error);
    res.status(500).json({ error: 'Failed to search cards' });
  }
});

module.exports = router;
