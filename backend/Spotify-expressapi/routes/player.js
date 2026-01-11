import express from 'express';
import { spotifyRequest } from '../utils/spotify.js';

const router = express.Router();

// Search for tracks, artists, albums, playlists
router.get('/', async (req, res) => {
  const { q, type = 'track,artist,album,playlist', limit = 20, offset = 0, market = 'US' } = req.query;

  if (!q) {
    return res.status(400).json({ error: { message: 'Query parameter "q" is required' } });
  }

  try {
    const params = new URLSearchParams({ q, type, limit, offset, market });
    const data = await spotifyRequest(`/search?${params}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Search specifically for tracks
router.get('/tracks', async (req, res) => {
  const { q, limit = 20, offset = 0, market = 'US' } = req.query;

  if (!q) {
    return res.status(400).json({ error: { message: 'Query parameter "q" is required' } });
  }

  try {
    const params = new URLSearchParams({ q, type: 'track', limit, offset, market });
    const data = await spotifyRequest(`/search?${params}`);
    res.json(data.tracks);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Search specifically for artists
router.get('/artists', async (req, res) => {
  const { q, limit = 20, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({ error: { message: 'Query parameter "q" is required' } });
  }

  try {
    const params = new URLSearchParams({ q, type: 'artist', limit, offset });
    const data = await spotifyRequest(`/search?${params}`);
    res.json(data.artists);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

export default router;