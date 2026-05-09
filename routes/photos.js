const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const exifr = require('exifr');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 50 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|heic|heif|tiff?/i;
    if (allowed.test(path.extname(file.originalname)) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

function parseExifDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val.toISOString();
  const str = String(val).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

router.post('/upload', requireAuth, upload.array('photos', 50), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = [];
  const insert = db.prepare('INSERT INTO photos VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

  for (const file of req.files) {
    let latitude = null, longitude = null, takenAt = null;

    try {
      const exif = await exifr.parse(file.path, {
        gps: true, exif: true, tiff: true, pick: ['DateTimeOriginal', 'DateTime', 'latitude', 'longitude']
      });
      if (exif) {
        latitude = exif.latitude ?? null;
        longitude = exif.longitude ?? null;
        takenAt = parseExifDate(exif.DateTimeOriginal || exif.DateTime);
      }
    } catch {
      // no EXIF — that's fine, store photo anyway
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    insert.run(id, req.user.id, file.filename, file.originalname, takenAt, latitude, longitude, createdAt);

    results.push({
      id,
      filename: file.filename,
      original_name: file.originalname,
      taken_at: takenAt,
      latitude,
      longitude,
      has_location: latitude !== null && longitude !== null
    });
  }

  res.status(201).json({
    uploaded: results.length,
    with_location: results.filter(r => r.has_location).length,
    photos: results
  });
});

router.get('/', requireAuth, (req, res) => {
  const photos = db.prepare(`
    SELECT id, filename, original_name, taken_at, latitude, longitude, created_at
    FROM photos WHERE user_id = ?
    ORDER BY COALESCE(taken_at, created_at) DESC
  `).all(req.user.id);
  res.json(photos);
});

router.delete('/:id', requireAuth, (req, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!photo) return res.status(404).json({ error: 'Not found' });

  const filePath = path.join(UPLOAD_DIR, photo.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);

  res.json({ deleted: true });
});

module.exports = router;
