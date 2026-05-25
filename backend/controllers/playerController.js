const { spotifyGet, spotifyPut, spotifyPost } = require('../services/spotifyClient');

function formatTrack(item, progress_ms, is_playing) {
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    artists: item.artists.map((a) => a.name),
    album: item.album?.name,
    albumArt: item.album?.images?.[0]?.url,
    duration_ms: item.duration_ms,
    progress_ms: progress_ms ?? null,
    is_playing: is_playing ?? null,
    spotify_url: item.external_urls?.spotify,
  };
}

function handleSpotifyError(err, res, action) {
  const status = err.status || err.response?.status || 500;
  const spotifyError = err.response?.data?.error;

  if (status === 401) {
    return res.status(401).json({ error: 'Please login first at /auth/login' });
  }
  if (status === 204 || spotifyError?.status === 204) {
    return res.status(404).json({
      error: 'No active device or nothing playing. Open Spotify on a device and start playback.',
    });
  }

  console.error(`${action} error:`, err.response?.data || err.message);
  res.status(status).json({
    error: spotifyError?.message || `Failed to ${action}`,
  });
}

exports.getCurrent = async (req, res) => {
  try {
    const { data, status } = await spotifyGet('/me/player/currently-playing', {
      market: process.env.SPOTIFY_MARKET || 'AU',
      additional_types: 'track',
    });

    if (status === 204 || !data?.item) {
      return res.status(404).json({ error: 'Nothing is currently playing' });
    }

    res.json({
      track: formatTrack(data.item, data.progress_ms, data.is_playing),
      device: data.device?.name,
      shuffle_state: data.shuffle_state,
      repeat_state: data.repeat_state,
    });
  } catch (err) {
    handleSpotifyError(err, res, 'get current track');
  }
};

exports.getPlaybackState = async (req, res) => {
  try {
    const { data, status } = await spotifyGet('/me/player', {
      market: process.env.SPOTIFY_MARKET || 'AU',
      additional_types: 'track',
    });

    if (status === 204 || !data) {
      return res.status(404).json({ error: 'No active playback' });
    }

    res.json({
      track: formatTrack(data.item, data.progress_ms, data.is_playing),
      device: data.device,
      is_playing: data.is_playing,
      shuffle_state: data.shuffle_state,
      repeat_state: data.repeat_state,
    });
  } catch (err) {
    handleSpotifyError(err, res, 'get playback state');
  }
};

exports.play = async (req, res) => {
  try {
    await spotifyPut('/me/player/play', req.query.device_id ? { device_id: req.query.device_id } : undefined);
    res.json({ message: 'Playback started' });
  } catch (err) {
    handleSpotifyError(err, res, 'play');
  }
};

exports.pause = async (req, res) => {
  try {
    await spotifyPut('/me/player/pause', req.query.device_id ? { device_id: req.query.device_id } : undefined);
    res.json({ message: 'Playback paused' });
  } catch (err) {
    handleSpotifyError(err, res, 'pause');
  }
};

exports.skipNext = async (req, res) => {
  try {
    await spotifyPost('/me/player/next', req.query.device_id ? { device_id: req.query.device_id } : undefined);
    res.json({ message: 'Skipped to next track' });
  } catch (err) {
    handleSpotifyError(err, res, 'skip next');
  }
};

exports.skipPrevious = async (req, res) => {
  try {
    await spotifyPost('/me/player/previous', req.query.device_id ? { device_id: req.query.device_id } : undefined);
    res.json({ message: 'Skipped to previous track' });
  } catch (err) {
    handleSpotifyError(err, res, 'skip previous');
  }
};
