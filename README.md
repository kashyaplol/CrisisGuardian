<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CrisisGuardian (Frontend + SQLite API)

This project now includes:
- React + Vite frontend
- Local Express API
- SQLite database persisted at `data/crisisguardian.db`

## Prerequisites

- Node.js 20+

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your backend env vars in `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   JWT_SECRET=your_strong_random_secret_here
   ```

3. Start frontend + API together:
   ```bash
   npm run dev:full
   ```

4. Open the app:
   - Frontend: `http://localhost:3000`
   - API health check: `http://localhost:3001/api/health`

## Useful Scripts

- `npm run dev` - frontend only
- `npm run dev:api` - API only
- `npm run dev:full` - frontend + API together
- `npm run build` - production frontend build
- `npm run start:api` - start API without watch mode

## Security Notes

- Authentication is handled server-side with HTTP-only signed session cookies.
- Passwords are hashed (`bcrypt`) before storage.
- AI calls are proxied through backend `/api/ai/*` routes so API keys are not exposed in the client bundle.

## Database Notes

- SQLite file location: `data/crisisguardian.db`
- Seed data is added automatically (institutions + test users).
- Existing test logins remain:
  - `student@test.com` / `password`
  - `admin@test.com` / `password`

## Deploy (Single Service)

This app can be deployed as a single Node service:
- Express serves `/api/*`
- Express also serves the built frontend (`dist/`)

### Render (recommended)

1. Push this repo to GitHub.
2. In Render, create a **Web Service** from the repo.
3. Set:
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variable:
   - `GEMINI_API_KEY=your_key`
5. Add a **Persistent Disk** (important for SQLite persistence):
   - Mount path: `/opt/render/project/src/data`
6. Deploy.

After deploy:
- App URL: `https://<your-service>.onrender.com`
- Health check: `https://<your-service>.onrender.com/api/health`

### Railway

1. Create a new Railway project from this repo.
2. Set:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Add env var:
   - `GEMINI_API_KEY=your_key`
4. Add a volume and mount it to the project `data` directory for SQLite persistence.

## Deploy with Docker

This repo now includes a `Dockerfile`.

Build image:
```bash
docker build -t crisisguardian .
```

Run container:
```bash
docker run -p 3001:3001 -e GEMINI_API_KEY=your_key -v $(pwd)/data:/app/data crisisguardian
```

Then open:
- `http://localhost:3001`
- `http://localhost:3001/api/health`
