# 🎙️ PodcastifyYT

> **Turn any YouTube channel into a podcast — automatically.**

PodcastifyYT is a creator-permissioned SaaS platform that converts YouTube video content into podcast-quality audio episodes distributed via RSS feeds to Spotify, Apple Podcasts, Amazon Music, and every other major platform.

Unlike audio-ripping tools, PodcastifyYT operates entirely within YouTube's Terms of Service — every channel is processed only after the creator explicitly authorises it via Google OAuth.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Running Locally (without Docker)](#running-locally-without-docker)
- [API Overview](#api-overview)
- [Background Tasks](#background-tasks)
- [Deployment](#deployment)

---

## Features

- **Google OAuth onboarding** — creators connect their YouTube channel in under 5 minutes
- **Real-time video detection** — YouTube WebSub (PubSubHubbub) push notifications with a polling fallback every 15 minutes
- **Automated audio pipeline** — yt-dlp extraction → FFmpeg loudness normalisation to –16 LUFS → Cloudinary storage
- **RSS 2.0 feed generation** — full Apple Podcasts namespace + Podcasting 2.0 support (chapters, transcripts, funding)
- **Directory submission wizard** — guided one-click submission to Spotify, Apple Podcasts, and Amazon Music
- **IABv2 analytics** — downloads, geographic breakdown, podcast app breakdown, weekly email digest
- **Tiered subscriptions** — Free, Starter, Pro, and Agency plans via Polar.sh
- **Creator dashboard** — episode manager, feed settings, filter config, and billing — all in one place

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Django 5, Django REST Framework |
| Auth | Google OAuth 2.0, JWT (SimpleJWT) |
| Task queue | Celery + Redis |
| Database | PostgreSQL 15 |
| Cache | Redis |
| Audio processing | yt-dlp, FFmpeg |
| Storage | Cloudinary |
| Billing | Polar.sh |
| Containerisation | Docker, Docker Compose |

---

## Project Structure

```
podcastifyyt/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/                        # Django project
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/                     # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/               # Google OAuth, JWT, Creator model
│   │   ├── channels/               # YouTube channel management, WebSub
│   │   ├── episodes/               # Audio extraction pipeline
│   │   ├── feeds/                  # RSS feed generation
│   │   ├── analytics/              # IABv2 download analytics
│   │   └── billing/                # Polar.sh subscriptions
│   └── tasks/                      # Celery task definitions
│
└── frontend/                       # Next.js app
    ├── Dockerfile
    ├── package.json
    ├── app/                        # App Router pages
    ├── components/
    ├── lib/
    ├── hooks/
    └── types/
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Or, for local development without Docker:
  - Python 3.11+
  - Node.js 18+
  - PostgreSQL 15
  - Redis 7
  - FFmpeg (`brew install ffmpeg` / `apt install ffmpeg`)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Oseni03/podcastifyyt.git
cd podcastifyyt
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values. See [Environment Variables](#environment-variables) for details.

### 3. Start with Docker

```bash
docker-compose up --build
```

The first run will build images, run Django migrations, and start all services.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Django Admin | http://localhost:8000/admin |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values before starting the project.

```bash
# Django core
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=localhost 127.0.0.1
DJANGO_SETTINGS_MODULE=config.settings

# PostgreSQL
DB_NAME=podcastifyyt
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db          # use 'localhost' when running without Docker
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Google OAuth — https://console.cloud.google.com
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/

# Cloudinary — https://cloudinary.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Polar.sh billing — https://polar.sh/dashboard
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_WEBHOOK_SECRET=
POLAR_PRODUCT_STARTER=
POLAR_PRODUCT_PRO=
POLAR_PRODUCT_AGENCY=

# WebSub — must be a publicly reachable URL (use ngrok in dev)
WEBSUB_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/channels/websub/callback/

# Frontend
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Running with Docker

### Start all services

```bash
docker-compose up --build
```

### Run in the background

```bash
docker-compose up -d
```

### Run Django management commands

```bash
# Migrations
docker-compose exec backend python manage.py migrate

# Create a superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Open a Django shell
docker-compose exec backend python manage.py shell
```

### View logs

```bash
docker-compose logs -f backend
docker-compose logs -f worker
```

### Stop everything

```bash
docker-compose down

# Stop and delete volumes (resets the database)
docker-compose down -v
```

---

## Running Locally (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Make sure PostgreSQL and Redis are running locally,
# then update DB_HOST=localhost and REDIS_URL=redis://localhost:6379/0 in .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Celery worker and beat (separate terminals)

```bash
cd backend
celery -A config worker --loglevel=info
celery -A config beat --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

All API routes are prefixed with `/api/`.

| Prefix | App | Description |
|---|---|---|
| `/api/auth/` | accounts | Google OAuth, JWT, creator profile |
| `/api/channels/` | channels | YouTube channel management, WebSub |
| `/api/episodes/` | episodes | Episode list, detail, retry |
| `/api/feeds/` | feeds | RSS preview, directory submissions |
| `/api/analytics/` | analytics | Download stats, geo, app breakdown |
| `/api/billing/` | billing | Polar checkout, portal, subscription |
| `/feed/<slug>/` | feeds | **Public** RSS feed (no `/api/` prefix) |

Full model, view, and route documentation is in [`backend/BACKEND.md`](./backend/BACKEND.md).

---

## Background Tasks

Celery handles all async processing. Key tasks:

| Task | Trigger | Description |
|---|---|---|
| `process_new_video_notification` | WebSub push / polling | Parses new video, applies creator filters, queues pipeline |
| `extract_audio` | After video detected | yt-dlp download → FFmpeg normalisation → Cloudinary upload |
| `poll_all_active_channels` | Every 15 min (Beat) | Polling fallback for missed WebSub pings |
| `renew_expiring_websub_subscriptions` | Daily (Beat) | Re-subscribes channels whose WebSub lease is expiring |
| `send_weekly_digest` | Every Monday 9am UTC (Beat) | Sends download summary email to each creator |
| `schedule_channel_cleanup` | 30 days after channel disconnect | Deletes audio files from Cloudinary |

---

## Deployment

### Production checklist

- [ ] Set `DEBUG=False`
- [ ] Set a strong, unique `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS` to your actual domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to your frontend domain
- [ ] Point `WEBSUB_CALLBACK_URL` to your live domain
- [ ] Set `GOOGLE_OAUTH_REDIRECT_URI` to your live domain
- [ ] Register your Polar webhook endpoint in the Polar dashboard
- [ ] Run `python manage.py collectstatic`
- [ ] Use Gunicorn instead of the Django dev server (`gunicorn config.wsgi:application`)
- [ ] Put Nginx in front of Gunicorn for static file serving and SSL termination

### Swap the backend command in production

```yaml
# docker-compose.yml
backend:
  command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

---

## License

MIT