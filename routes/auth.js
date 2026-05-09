const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../data/db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const AVATAR_COLORS = [
  '#38bdf8', '#a78bfa', '#f472b6', '#fb923c',
  '#4ade80', '#facc15', '#f87171', '#34d399'
];

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3-30 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(409).json({ error: 'Email or username already taken' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const createdAt = new Date().toISOString();

  db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)').run(
    id, username, email, passwordHash, avatarColor, createdAt
  );

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, username, email, avatar_color: avatarColor } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, avatar_color: user.avatar_color }
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
