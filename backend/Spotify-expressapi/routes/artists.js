// routes/artists.js
import express from 'express';
import { spotifyRequest } from '../utils/spotify.js';

const router = express.Router();

// Get artist details by ID
router.get('/:artist_id', async (req, res) => {
  const { artist_id } = req.params;

  try {
    const data = await spotifyRequest(`/artists/${artist_id}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get multiple artists by IDs
router.get('/', async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: { message: 'ids parameter is required (comma-separated)' } });
  }

  try {
    const data = await spotifyRequest(`/artists?ids=${ids}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get artist's top tracks
router.get('/:artist_id/top-tracks', async (req, res) => {
  const { artist_id } = req.params;
  const { market = 'US' } = req.query;

  try {
    const data = await spotifyRequest(`/artists/${artist_id}/top-tracks?market=${market}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get artist's albums
router.get('/:artist_id/albums', async (req, res) => {
  const { artist_id } = req.params;
  const { include_groups = 'album,single', market = 'US', limit = 20, offset = 0 } = req.query;

  try {
    const params = new URLSearchParams({ include_groups, market, limit, offset });
    const data = await spotifyRequest(`/artists/${artist_id}/albums?${params}`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get related artists
router.get('/:artist_id/related-artists', async (req, res) => {
  const { artist_id } = req.params;

  try {
    const data = await spotifyRequest(`/artists/${artist_id}/related-artists`);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

// Get artist statistics (formatted summary)
router.get('/:artist_id/stats', async (req, res) => {
  const { artist_id } = req.params;

  try {
    // Fetch artist data and top tracks in parallel
    const [artistData, topTracksData] = await Promise.all([
      spotifyRequest(`/artists/${artist_id}`),
      spotifyRequest(`/artists/${artist_id}/top-tracks?market=US`)
    ]);

    const stats = {
      name: artistData.name,
      genres: artistData.genres,
      popularity: artistData.popularity,
      followers: artistData.followers.total,
      images: artistData.images,
      top_tracks: topTracksData.tracks.slice(0, 5).map(track => ({
        name: track.name,
        popularity: track.popularity,
        album: track.album.name,
        duration_ms: track.duration_ms,
        preview_url: track.preview_url
      })),
      external_urls: artistData.external_urls
    };

    res.json(stats);
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
});

export default router;