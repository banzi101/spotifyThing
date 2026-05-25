let accessToken = '';
let refreshToken = '';

function setTokens({ access_token, refresh_token }) {
  accessToken = access_token;
  if (refresh_token) refreshToken = refresh_token;
}

function getAccessToken() {
  return accessToken;
}

function getRefreshToken() {
  return refreshToken;
}

module.exports = { setTokens, getAccessToken, getRefreshToken };
