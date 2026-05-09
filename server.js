const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CrossPaths API
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/users'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/paths', require('./routes/paths'));

// Portfolio API (legacy)
const portfolioData = require('./data/portfolio.json');
app.get('/api/portfolio', (req, res) => res.json(portfolioData));
app.get('/api/projects', (req, res) => res.json(portfolioData.projects));
app.get('/api/projects/:id', (req, res) => {
  const project = portfolioData.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});
app.get('/api/about', (req, res) => res.json(portfolioData.about));

// HTML routes — must come before express.static so it can't intercept /app (a real directory)
const CROSSPATHS = path.join(__dirname, 'public', 'app', 'index.html');
const PORTFOLIO  = path.join(__dirname, 'public', 'index.html');

app.get('/',        (req, res) => res.sendFile(CROSSPATHS));
app.get('/app',     (req, res) => res.sendFile(CROSSPATHS));
app.get('/app/*',   (req, res) => res.sendFile(CROSSPATHS));
app.get('/portfolio', (req, res) => res.sendFile(PORTFOLIO));

// Static assets (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Fallback — serve CrossPaths for any unknown route
app.get('*', (req, res) => res.sendFile(CROSSPATHS));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
