const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = 5000;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const scope = 'user-read-currently-playing user-read-playback-state';

let access_token = '';
let refresh_token = '';

app.get('/login', (req, res) => {
  const authURL = new URL('https://accounts.spotify.com/authorize');
  authURL.searchParams.append('client_id', client_id);
  authURL.searchParams.append('response_type', 'code');
  authURL.searchParams.append('redirect_uri', redirect_uri);
  authURL.searchParams.append('scope', scope);

  res.redirect(authURL.toString());
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id,
        client_secret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    access_token = tokenRes.data.access_token;
    refresh_token = tokenRes.data.refresh_token;

    res.send('✅ Logged in! You can now close this tab.');
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.send('Error during token exchange.');
  }
});

app.get('/current', async (req, res) => {
  if (!access_token) return res.status(401).send('Please login first');

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing?market=AU', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const artistNames = response.data.item.artists.map(artist => artist.name);;
    const songName = response.data.item.name;

    res.json({
      artistNames, 
      songName
    });
  } catch (err) {
    console.error('Error fetching current playback:', err.response?.data || err.message);
    res.status(500).send('Failed to fetch playback info');
  }
});





app.listen(port, () => {
  console.log(`Spotify auth server running at http://localhost:${port}`);
  console.log(`Login here: http://localhost:${port}/login`);
});
