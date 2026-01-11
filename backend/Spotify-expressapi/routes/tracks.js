import express from 'express';
import { spotifyRequest } from '../utils/spotify.js';

const router = express.Router();

// Get track details by ID
router.get('/:track_id', async (req, res) => {
  const { track_id } = req.params;
  const { market = 'US' } = req.query;

  try {
    const data = await spotifyRequest(`/tracks/${track_id}?market=${market}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get multiple tracks by IDs
router.get('/', async (req, res) => {
  const { ids, market = 'US' } = req.query;

  if (!ids) {
    return res.status(400).json({ error: { message: 'ids parameter is required (comma-separated)' } });
  }

  try {
    const data = await spotifyRequest(`/tracks?ids=${ids}&market=${market}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get track audio features (tempo, danceability, energy, etc.)
router.get('/:track_id/features', async (req, res) => {
  const { track_id } = req.params;

  try {
    const data = await spotifyRequest(`/audio-features/${track_id}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get track audio analysis (detailed)
router.get('/:track_id/analysis', async (req, res) => {
  const { track_id } = req.params;

  try {
    const data = await spotifyRequest(`/audio-analysis/${track_id}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get recommendations based on a track
router.get('/:track_id/recommendations', async (req, res) => {
  const { track_id } = req.params;
  const { limit = 20 } = req.query;

  try {
    const data = await spotifyRequest(`/recommendations?seed_tracks=${track_id}&limit=${limit}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

export default router;