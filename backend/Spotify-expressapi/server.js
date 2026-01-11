// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import playerRoutes from './routes/player.js';
import playlistRoutes from './routes/playlists.js';
import trackRoutes from './routes/tracks.js';
import artistRoutes from './routes/artists.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/artists', artistRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

app.listen(PORT, () => {
  console.log(`🎵 Spotify API Server running on http://127.0.0.1:${PORT}`);
});
