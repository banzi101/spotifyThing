const axios = require('axios');
const { setTokens } = require('../lib/tokenStore');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const scope = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

exports.login = async (req, res) => {
  const authURL = new URL('https://accounts.spotify.com/authorize');
  authURL.searchParams.append('client_id', client_id);
  authURL.searchParams.append('response_type', 'code');
  authURL.searchParams.append('redirect_uri', redirect_uri);
  authURL.searchParams.append('scope', scope);

  res.redirect(authURL.toString());
};

exports.callback = async (req, res) => {
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

    setTokens({
      access_token: tokenRes.data.access_token,
      refresh_token: tokenRes.data.refresh_token,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?loggedIn=1`);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.status(500).send('Error during token exchange.');
  }
};
