const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Search users by username (excludes self and already-friended)
router.get('/users/search', requireAuth, (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);

  const users = db.prepare(`
    SELECT u.id, u.username, u.avatar_color
    FROM users u
    WHERE u.username LIKE ? AND u.id != ?
      AND u.id NOT IN (
        SELECT CASE WHEN requester_id = ? THEN recipient_id ELSE requester_id END
        FROM friendships
        WHERE (requester_id = ? OR recipient_id = ?)
      )
    LIMIT 10
  `).all(`%${q}%`, req.user.id, req.user.id, req.user.id, req.user.id);

  res.json(users);
});

// Get all friendships for current user
router.get('/friends', requireAuth, (req, res) => {
  const friends = db.prepare(`
    SELECT
      f.id as friendship_id,
      f.status,
      f.requester_id,
      f.created_at as friendship_created_at,
      u.id, u.username, u.avatar_color
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.recipient_id ELSE f.requester_id END
    WHERE f.requester_id = ? OR f.recipient_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id, req.user.id, req.user.id);

  res.json(friends);
});

// Send a friend request
router.post('/friends/request', requireAuth, (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  if (userId === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

  const target = db.prepare('SELECT id, username, avatar_color FROM users WHERE id = ?').get(userId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const existing = db.prepare(`
    SELECT id FROM friendships
    WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)
  `).get(req.user.id, userId, userId, req.user.id);

  if (existing) return res.status(409).json({ error: 'Friendship already exists' });

  const id = uuidv4();
  db.prepare('INSERT INTO friendships VALUES (?, ?, ?, ?, ?)').run(
    id, req.user.id, userId, 'pending', new Date().toISOString()
  );

  res.status(201).json({ id, status: 'pending', user: target });
});

// Accept a friend request
router.put('/friends/:id/accept', requireAuth, (req, res) => {
  const friendship = db.prepare('SELECT * FROM friendships WHERE id = ?').get(req.params.id);
  if (!friendship) return res.status(404).json({ error: 'Not found' });
  if (friendship.recipient_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the recipient can accept' });
  }
  if (friendship.status !== 'pending') {
    return res.status(400).json({ error: 'Already responded' });
  }

  db.prepare('UPDATE friendships SET status = ? WHERE id = ?').run('accepted', req.params.id);
  res.json({ id: req.params.id, status: 'accepted' });
});

// Remove a friend / decline a request
router.delete('/friends/:id', requireAuth, (req, res) => {
  const friendship = db.prepare('SELECT * FROM friendships WHERE id = ?').get(req.params.id);
  if (!friendship) return res.status(404).json({ error: 'Not found' });
  if (friendship.requester_id !== req.user.id && friendship.recipient_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your friendship' });
  }

  db.prepare('DELETE FROM friendships WHERE id = ?').run(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
