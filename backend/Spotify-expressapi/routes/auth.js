import express from 'express';
import { generateRandomString } from '../utils/helpers.js';
import { spotifyApi } from '../config/spotify.js';

const router = express.Router();

let accessToken = '';
let refreshToken = '';
let tokenExpiry = 0;

// Login endpoint - initiates OAuth flow
router.get('/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative';

  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.REDIRECT_URI || 'http://127.0.0.1:3000/auth/callback',
    state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${authParams.toString()}`);
});

// Callback endpoint - exchanges code for tokens
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: { message: 'Authorization failed', details: error } });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        code,
        redirect_uri: process.env.REDIRECT_URI || 'http://127.0.0.1:3000/auth/callback',
        grant_type: 'authorization_code'
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    res.redirect('/auth/success');
  } catch (err) {
    res.status(500).json({ error: { message: 'Token exchange failed', details: err.message } });
  }
});

// Get current access token
router.get('/token', (req, res) => {
  if (!accessToken || Date.now() >= tokenExpiry) {
    return res.status(401).json({ error: { message: 'No valid token available' } });
  }

  res.json({
    access_token: accessToken,
    expires_in: Math.floor((tokenExpiry - Date.now()) / 1000)
  });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  if (!refreshToken) {
    return res.status(401).json({ error: { message: 'No refresh token available' } });
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    accessToken = data.access_token;
    if (data.refresh_token) refreshToken = data.refresh_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    res.json({ access_token: accessToken, expires_in: data.expires_in });
  } catch (err) {
    res.status(500).json({ error: { message: 'Token refresh failed', details: err.message } });
  }
});

export { accessToken };
export default router;