LucidGrowth
===========

Monorepo containing a NestJS backend and Next.js frontend to connect to multiple IMAP servers, sync emails, process analytics, and provide full-text search.

Structure
---------
- `backend/api`: NestJS app
- `frontend/web`: Next.js app

Setup
-----
1. Prerequisites: Node.js 20+, MongoDB 6+
2. Backend:
   - Copy `backend/api/.env.example` to `backend/api/.env` and edit values
   - `cd backend/api && npm run start:dev`
3. Frontend:
   - `cd frontend/web && npm run dev`

Deployment
----------
- Frontend: Vercel
- Backend: Render/Heroku. Set environment variables for Mongo and IMAP pool.

Notes
-----
- The backend exposes endpoints under `/emails`, `/search/emails`, `/sync/*`, `/analytics/summary`.

