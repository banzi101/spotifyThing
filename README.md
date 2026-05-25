# spotifyThing

Spotify playback controller with a separate API backend and Vite frontend.

## Setup

1. Copy env files and fill in your Spotify app credentials:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), set the redirect URI to:

   ```
   http://localhost:5000/auth/callback
   ```

3. Install dependencies:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

## Run

Start both servers:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Project structure

```
backend/     Express API (auth + player)
frontend/    Vite static UI
```
