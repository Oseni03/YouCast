# YouCast AI Agent Instructions

## Purpose
This file helps AI coding agents work effectively in the YouCast repository by summarizing the main architecture, project conventions, and useful commands.

## High-level architecture
- `backend/` is a Django REST API with Django REST Framework and Inngest for async pipelines.
- `frontend/` is a Next.js 14 app using TypeScript, Tailwind CSS, and React.
- `docker-compose.yml` orchestrates the full stack locally.
- `DESIGN.md` defines the frontend design system and the "Soft Minimalism" UI style.

## Primary domains
- `backend/apps/accounts/` — creator accounts, Google OAuth, JWT auth
- `backend/apps/channels/` — YouTube channel management, WebSub, channel metadata, polling
- `backend/apps/episodes/` — audio extraction, yt-dlp + FFmpeg pipeline
- `backend/apps/feeds/` — RSS feed generation, Apple Podcasts / Podcasting 2.0 support
- `backend/apps/analytics/` — download analytics, weekly digest workflows
- `backend/apps/billing/` — subscription plans and Polar.sh billing integration

## Important conventions
- Business logic typically lives in `apps/*/services/` and `apps/*/workflows.py`.
- `backend/config/settings.py` contains main Django and Inngest configuration.
- API routes are defined under `backend/config/urls.py` and per-app `urls.py` files.
- Frontend data access uses hooks in `frontend/src/hooks/` and API helpers in `frontend/src/lib/`.
- The UI should follow the `DESIGN.md` palette, typography, and "No-Line" rule for layout boundaries.

## Build and run commands
### Docker compose
```bash
docker-compose up --build
```

### Backend local
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend local
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
python manage.py test
```

## Where to read first
- `README.md` — repo overview, features, and setup
- `backend/README.md` — backend-specific env vars, Inngest details, local dev notes
- `frontend/README.md` — frontend setup and Next.js basics
- `DESIGN.md` — frontend visual and UX conventions

## What to avoid
- Do not invent a different backend architecture; keep changes within Django/DRF + Inngest conventions.
- Do not add explicit 1px borders for layout division in the frontend; use background tone shifts instead.
- When changing auth or billing flows, preserve the existing Google OAuth + JWT and Polar.sh integration patterns.

## Useful quick facts
- The public WebSub callback endpoint is `POST /api/channels/websub/callback/`.
- Feed XML is generated from `backend/apps/feeds/`.
- Audio extraction uses `yt-dlp` and `FFmpeg` to normalize to -16 LUFS.
- Frontend state is managed with React hooks and an API service layer, not a separate global state lib.
