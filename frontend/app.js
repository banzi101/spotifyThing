const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusEl = document.getElementById('status');
const nowPlayingEl = document.getElementById('now-playing');
const coverEl = document.getElementById('cover');
const trackNameEl = document.getElementById('track-name');
const trackArtistsEl = document.getElementById('track-artists');
const trackAlbumEl = document.getElementById('track-album');
const progressBarEl = document.getElementById('progress-bar');
const trackTimeEl = document.getElementById('track-time');
const loginLinkEl = document.getElementById('login-link');
const playPauseBtn = document.getElementById('btn-play-pause');

let pollTimer = null;
let isPlaying = false;

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function updatePlayPauseButton(playing) {
  isPlaying = playing;
  playPauseBtn.textContent = playing ? '⏸' : '▶';
  playPauseBtn.title = playing ? 'Pause' : 'Play';
  playPauseBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

async function api(path, method = 'GET') {
  const res = await fetch(`${API_URL}${path}`, { method });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  return { ok: res.ok, status: res.status, data };
}

function renderTrack(payload) {
  const track = payload.track;
  if (!track) return;

  nowPlayingEl.hidden = false;
  trackNameEl.textContent = track.name;
  trackArtistsEl.textContent = track.artists.join(', ');
  trackAlbumEl.textContent = track.album || '';

  if (track.albumArt) {
    coverEl.src = track.albumArt;
    coverEl.alt = `${track.name} cover`;
  } else {
    coverEl.removeAttribute('src');
    coverEl.alt = '';
  }

  const progress = track.progress_ms ?? 0;
  const duration = track.duration_ms ?? 1;
  const pct = Math.min(100, (progress / duration) * 100);
  progressBarEl.style.width = `${pct}%`;
  trackTimeEl.textContent = `${formatTime(progress)} / ${formatTime(duration)}`;

  updatePlayPauseButton(Boolean(track.is_playing));

  const playing = track.is_playing ? 'Playing' : 'Paused';
  const device = payload.device ? ` on ${payload.device}` : '';
  setStatus(`${playing}${device}`);
}

async function fetchCurrent() {
  const { ok, status, data } = await api('/player/current');

  if (status === 401) {
    nowPlayingEl.hidden = true;
    setStatus('Not logged in. Click "Log in with Spotify" above.', true);
    return false;
  }

  if (!ok) {
    nowPlayingEl.hidden = true;
    setStatus(data?.error || 'Could not load playback.', true);
    return false;
  }

  renderTrack(data);
  return true;
}

async function playerAction(path, method, successMessage) {
  const buttons = document.querySelectorAll('.control, .refresh');
  buttons.forEach((b) => (b.disabled = true));

  const { ok, status, data } = await api(path, method);

  buttons.forEach((b) => (b.disabled = false));

  if (status === 401) {
    setStatus('Not logged in. Log in with Spotify first.', true);
    return;
  }

  if (!ok) {
    setStatus(data?.error || 'Action failed.', true);
    return;
  }

  setStatus(data?.message || successMessage);
  await fetchCurrent();
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(fetchCurrent, 5000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    playerAction('/player/pause', 'PUT', 'Paused');
  } else {
    playerAction('/player/play', 'PUT', 'Playing');
  }
});
document.getElementById('btn-next').addEventListener('click', () =>
  playerAction('/player/next', 'POST', 'Skipped forward')
);
document.getElementById('btn-previous').addEventListener('click', () =>
  playerAction('/player/previous', 'POST', 'Skipped back')
);
document.getElementById('btn-refresh').addEventListener('click', fetchCurrent);

loginLinkEl.href = `${API_URL}/auth/login`;

loginLinkEl.addEventListener('click', () => {
  setStatus('Complete login in the new tab, then return here.');
});

if (new URLSearchParams(window.location.search).get('loggedIn')) {
  setStatus('Logged in. Start playback in Spotify, then use the controls.');
  window.history.replaceState({}, '', window.location.pathname);
}

fetchCurrent().then((ok) => {
  if (ok) startPolling();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    fetchCurrent().then((ok) => {
      if (ok) startPolling();
    });
  }
});
