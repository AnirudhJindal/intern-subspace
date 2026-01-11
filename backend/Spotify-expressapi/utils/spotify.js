import { accessToken } from '../routes/auth.js';

export async function spotifyRequest(endpoint, method = 'GET', body = null) {
  const token = accessToken;
  
  if (!token) {
    const error = new Error('Not authenticated. Please login first.');
    error.status = 401;
    throw error;
  }

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, options);

  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || 'Spotify API error');
    error.status = response.status;
    throw error;
  }

  return data;
}