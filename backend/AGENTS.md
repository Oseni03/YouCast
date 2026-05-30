# Backend AI Agent Instructions

## Purpose
Help AI agents make safe, consistent backend changes in the YouCast Django API.

## Key backend conventions
- Use `backend/apps/*/services/` for business logic and `backend/apps/*/workflows.py` for async pipelines.
- Keep API shape in `backend/config/urls.py` and per-app `urls.py` files.
- Preserve Google OAuth + JWT auth patterns and Polar.sh billing integration.
- The backend uses Inngest for durable background work and event workflows.
- `backend/config/settings.py` is the main source of truth for Django, CORS, auth, and Inngest configuration.

## Important folders
- `backend/apps/accounts/` — auth, creator model, Google OAuth, token handling
- `backend/apps/channels/` — YouTube channel onboarding, WebSub callback, filtering, metadata refresh
- `backend/apps/episodes/` — audio extraction pipeline, episode model, storage services
- `backend/apps/feeds/` — RSS feed generation and feed URL routing
- `backend/apps/analytics/` — analytics event aggregation and digest workflows
- `backend/apps/billing/` — subscription plans, products, and Polar.sh service integration

## Build and local development
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Tests
```bash
cd backend
python manage.py test
```

## Where to read first
- `backend/README.md` — backend setup, env vars, Inngest tips
- `README.md` — overall project context and high-level architecture

## What to avoid
- Do not invent a different backend architecture; keep changes within Django/DRF + Inngest.
- Do not replace the existing auth or billing flow with a new provider unless there is a clear project need.
- Do not add explicit `1px` borders for frontend layout in backend UI prototypes; follow `DESIGN.md` conventions in the frontend.

## Useful quick facts
- Public WebSub callback endpoint: `POST /api/channels/websub/callback/`
- Feed XML generation is handled in `backend/apps/feeds/`
- Audio extraction pipeline is in `backend/apps/episodes/services/` and `backend/apps/episodes/models.py`
