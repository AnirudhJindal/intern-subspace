/ routes/playlists.js
import express from 'express';
import { spotifyRequest } from '../utils/spotify.js';

const router = express.Router();

// Get user's playlists
router.get('/me', async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  try {
    const params = new URLSearchParams({ limit, offset });
    const data = await spotifyRequest(`/me/playlists?${params}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Search user's playlists by name
router.get('/me/search', async (req, res) => {
  const { q, limit = 50 } = req.query;

  if (!q) {
    return res.status(400).json({ error: { message: 'Query parameter "q" is required' } });
  }

  try {
    const data = await spotifyRequest(`/me/playlists?limit=${limit}`);
    const filtered = data.items.filter(playlist => 
      playlist.name.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json({
      items: filtered,
      total: filtered.length,
      query: q
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Play a specific playlist
router.post('/:playlist_id/play', async (req, res) => {
  const { playlist_id } = req.params;
  const { device_id, offset } = req.body;

  try {
    const params = device_id ? `?device_id=${device_id}` : '';
    const body = {
      context_uri: `spotify:playlist:${playlist_id}`
    };
    
    if (offset !== undefined) {
      body.offset = { position: offset };
    }

    await spotifyRequest(`/me/player/play${params}`, 'PUT', body);
    res.json({ message: 'Playlist started playing', playlist_id });
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get specific playlist
router.get('/:playlist_id', async (req, res) => {
  const { playlist_id } = req.params;
  const { market = 'US' } = req.query;

  try {
    const data = await spotifyRequest(`/playlists/${playlist_id}?market=${market}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get playlist tracks
router.get('/:playlist_id/tracks', async (req, res) => {
  const { playlist_id } = req.params;
  const { limit = 100, offset = 0, market = 'US' } = req.query;

  try {
    const params = new URLSearchParams({ limit, offset, market });
    const data = await spotifyRequest(`/playlists/${playlist_id}/tracks?${params}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

export default router;
