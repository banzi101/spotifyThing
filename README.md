# spotifyThing

Spotify playback controller with a separate API backend and Vite frontend.

## Local development

1. Copy env files and fill in your Spotify app credentials:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), add redirect URI:

   ```
   http://localhost:5000/auth/callback
   ```

3. Install dependencies:

   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

4. Run both apps:

   ```bash
   npm run dev
   ```

   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:5000

## Deploy: Render (backend) + Vercel (frontend)

Deploy the **backend first**, then the frontend, then update env vars and Spotify settings.

### 1. Backend on Render

**Option A — Blueprint (recommended)**

1. Push this repo to GitHub.
2. In [Render](https://render.com): **New** → **Blueprint** → connect the repo.
3. Render reads `render.yaml` and creates the `spotify-api` web service.
4. Set these environment variables in the Render service dashboard (replace URLs after you know them):

   | Variable | Example |
   |----------|---------|
   | `CLIENT_ID` | from Spotify Dashboard |
   | `CLIENT_SECRET` | from Spotify Dashboard |
   | `REDIRECT_URI` | `https://spotify-api.onrender.com/auth/callback` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `SPOTIFY_MARKET` | `AU` (optional) |

   `PORT` is set automatically by Render.

5. Deploy and copy your service URL (e.g. `https://spotify-api.onrender.com`).

**Option B — Manual web service**

1. **New** → **Web Service** → connect repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add the same environment variables as above.

### 2. Frontend on Vercel

1. In [Vercel](https://vercel.com): **Add New** → **Project** → import the repo.
2. **Root Directory:** `frontend` (important).
3. Framework should auto-detect as Vite (or use settings from `frontend/vercel.json`).
4. Add environment variable:

   | Variable | Value |
   |----------|--------|
   | `VITE_API_URL` | your Render URL, e.g. `https://spotify-api.onrender.com` |

5. Deploy and copy your Vercel URL (e.g. `https://spotify-thing.vercel.app`).

### 3. Wire everything together

1. **Render:** set `FRONTEND_URL` to your exact Vercel URL (no trailing slash), e.g. `https://spotify-thing.vercel.app`. Redeploy if needed.
2. **Spotify Dashboard:** add redirect URI:

   ```
   https://<your-render-host>/auth/callback
   ```

   Keep `http://localhost:5000/auth/callback` if you still develop locally.

3. **Vercel:** confirm `VITE_API_URL` points at Render; redeploy if you change it (Vite bakes this in at build time).

### 4. Use the app

1. Open your Vercel URL.
2. Click **Log in with Spotify** (redirects to Render for OAuth, then back to Vercel).
3. Start playback in the Spotify app on a device (Premium required for player controls).

### Notes

- Tokens are stored in memory on the server; a Render restart or redeploy requires logging in again.
- Free Render services may sleep; the first request after idle can be slow.
- `CLIENT_SECRET` must only live on Render, never in Vercel.

## Project structure

```
backend/     Express API (auth + player) → Render
frontend/    Vite static UI             → Vercel
render.yaml  Render Blueprint config
```
