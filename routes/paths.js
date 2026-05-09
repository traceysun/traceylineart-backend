const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find crossed paths with all accepted friends
// Query params: distance_m (default 200), time_hours (default 1)
router.get('/crossed', requireAuth, (req, res) => {
  const distanceM = Math.min(parseInt(req.query.distance_m) || 200, 5000);
  const timeHours = Math.min(parseFloat(req.query.time_hours) || 1, 48);
  const timeSeconds = timeHours * 3600;

  // Get accepted friends
  const friends = db.prepare(`
    SELECT u.id, u.username, u.avatar_color
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.recipient_id ELSE f.requester_id END
    WHERE (f.requester_id = ? OR f.recipient_id = ?) AND f.status = 'accepted'
  `).all(req.user.id, req.user.id, req.user.id);

  if (friends.length === 0) return res.json([]);

  // Get my geotagged photos
  const myPhotos = db.prepare(`
    SELECT id, filename, taken_at, latitude, longitude
    FROM photos
    WHERE user_id = ? AND latitude IS NOT NULL AND taken_at IS NOT NULL
  `).all(req.user.id);

  const crossings = [];
  const seenKeys = new Set();

  for (const friend of friends) {
    const friendPhotos = db.prepare(`
      SELECT id, filename, taken_at, latitude, longitude
      FROM photos
      WHERE user_id = ? AND latitude IS NOT NULL AND taken_at IS NOT NULL
    `).all(friend.id);

    for (const mine of myPhotos) {
      const myTime = new Date(mine.taken_at).getTime();
      if (isNaN(myTime)) continue;

      for (const theirs of friendPhotos) {
        const theirTime = new Date(theirs.taken_at).getTime();
        if (isNaN(theirTime)) continue;

        const timeDiffS = Math.abs(myTime - theirTime) / 1000;
        if (timeDiffS > timeSeconds) continue;

        const dist = haversineMeters(mine.latitude, mine.longitude, theirs.latitude, theirs.longitude);
        if (dist > distanceM) continue;

        // Deduplicate by 500m grid cell + 2h time bucket
        const cellLat = Math.round(mine.latitude * 200) / 200; // ~500m
        const cellLon = Math.round(mine.longitude * 200) / 200;
        const timeBucket = Math.floor(Math.min(myTime, theirTime) / (2 * 3600 * 1000));
        const key = `${friend.id}|${cellLat},${cellLon}|${timeBucket}`;

        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        crossings.push({
          id: `${mine.id}-${theirs.id}`,
          friend: { id: friend.id, username: friend.username, avatar_color: friend.avatar_color },
          latitude: (mine.latitude + theirs.latitude) / 2,
          longitude: (mine.longitude + theirs.longitude) / 2,
          date: mine.taken_at < theirs.taken_at ? mine.taken_at : theirs.taken_at,
          distance_m: Math.round(dist),
          time_diff_minutes: Math.round(timeDiffS / 60),
          my_photo: { id: mine.id, filename: mine.filename, taken_at: mine.taken_at },
          friend_photo: { id: theirs.id, filename: theirs.filename, taken_at: theirs.taken_at }
        });
      }
    }
  }

  crossings.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(crossings);
});

// Summary stats for dashboard
router.get('/stats', requireAuth, (req, res) => {
  const friendCount = db.prepare(`
    SELECT COUNT(*) as n FROM friendships
    WHERE (requester_id = ? OR recipient_id = ?) AND status = 'accepted'
  `).get(req.user.id, req.user.id).n;

  const photoCount = db.prepare('SELECT COUNT(*) as n FROM photos WHERE user_id = ?').get(req.user.id).n;
  const geoCount = db.prepare('SELECT COUNT(*) as n FROM photos WHERE user_id = ? AND latitude IS NOT NULL').get(req.user.id).n;

  res.json({ friends: friendCount, photos: photoCount, geotagged: geoCount });
});

module.exports = router;
