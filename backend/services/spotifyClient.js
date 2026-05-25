const axios = require('axios');
const { getAccessToken, getRefreshToken, setTokens } = require('../lib/tokenStore');

const SPOTIFY_API = 'https://api.spotify.com/v1';

async function refreshAccessToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error('No refresh token');

  const tokenRes = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  setTokens({
    access_token: tokenRes.data.access_token,
    refresh_token: tokenRes.data.refresh_token ?? refresh_token,
  });
}

async function spotifyRequest(config) {
  let token = getAccessToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }

  try {
    return await axios({
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        ...config.headers,
      },
    });
  } catch (err) {
    if (err.response?.status === 401 && getRefreshToken()) {
      await refreshAccessToken();
      token = getAccessToken();
      return axios({
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
          ...config.headers,
        },
      });
    }
    throw err;
  }
}

function spotifyPut(path, params) {
  return spotifyRequest({
    method: 'PUT',
    url: `${SPOTIFY_API}${path}`,
    params,
  });
}

function spotifyPost(path, params) {
  return spotifyRequest({
    method: 'POST',
    url: `${SPOTIFY_API}${path}`,
    params,
  });
}

function spotifyGet(path, params) {
  return spotifyRequest({
    method: 'GET',
    url: `${SPOTIFY_API}${path}`,
    params,
  });
}

module.exports = { spotifyGet, spotifyPut, spotifyPost };
