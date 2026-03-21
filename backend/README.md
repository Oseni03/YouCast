# 🎙 AudioSync – Backend (Django API)

Backend API for AudioSync built with **Django + Django REST Framework**, using:

* PostgreSQL (Database)
* Redis (Cache + Sessions + Celery Broker)
* Celery (Async task queue)
* JWT Authentication (SimpleJWT with refresh rotation)
* Google OAuth
* WebSub (PubSubHubbub)
* CORS support for Next.js frontend

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Core
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost 127.0.0.1

# Database (PostgreSQL)
DB_NAME=audiosync
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Frontend
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/

# WebSub
WEBSUB_CALLBACK_URL=http://localhost:8000/api/channels/websub/callback/

# Email (SendGrid Example)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=hello@audiosync.com
```

---

# 🗄 Database Setup (PostgreSQL)

Make sure PostgreSQL is running.

Create database:

```sql
CREATE DATABASE podcastifyyt;
```

Then run:

```bash
python manage.py migrate
```

Create superuser:

```bash
python manage.py createsuperuser
```

---

# 🔴 Redis Setup

Ensure Redis is installed and running:

```bash
redis-server
```

Redis is used for:

* Caching
* Session storage
* Celery broker & result backend

---

# ⚡ Celery Setup

AudioSync uses Celery for background tasks such as audio processing, WebSub notifications, feed generation, and analytics aggregation.

---

## 🖥 Running Celery Locally (Without Docker)

Make sure Redis is already running (`redis-server`) and your virtual environment is active.

### Start the Celery Worker

```bash
celery -A config worker --loglevel=info
```

For development, you can run a single worker with one concurrency thread to keep logs clean:

```bash
celery -A config worker --loglevel=info --concurrency=1
```

### Start Celery Beat (Scheduled Tasks)

If your project uses periodic tasks, run Celery Beat alongside the worker:

```bash
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Run Worker + Beat Together (Dev Shortcut)

> ⚠️ Not recommended for production — use separate processes there.

```bash
celery -A config worker --beat --loglevel=info
```

### Monitor Tasks with Flower (Optional)

Flower is a real-time Celery monitoring UI:

```bash
pip install flower
celery -A config flower --port=5555
```

Then open: [http://localhost:5555](http://localhost:5555)

---

## 🐳 Running Celery With Docker

The project includes Docker Compose services for the full stack. Make sure your `docker-compose.yml` includes the following services alongside `web`, `db`, and `redis`:

```yaml
services:
  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: audiosync
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery_worker:
    build: .
    command: celery -A config worker --loglevel=info --concurrency=2
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - redis
      - db

  celery_beat:
    build: .
    command: celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - redis
      - db

  flower:
    build: .
    command: celery -A config flower --port=5555
    ports:
      - "5555:5555"
    env_file:
      - .env
    depends_on:
      - redis

volumes:
  postgres_data:
```

> Update `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` in your `.env` to use the Docker Redis service name:
>
> ```env
> CELERY_BROKER_URL=redis://redis:6379/0
> CELERY_RESULT_BACKEND=redis://redis:6379/1
> REDIS_URL=redis://redis:6379/0
> ```

### Start All Services

```bash
docker compose up --build
```

### Start Only Celery Services

```bash
docker compose up celery_worker celery_beat
```

### View Celery Worker Logs

```bash
docker compose logs -f celery_worker
```

### Run a One-Off Celery Task Inside Docker

```bash
docker compose exec celery_worker celery -A config call myapp.tasks.my_task
```

---

## 🗂 Celery Configuration Reference

Your `config/celery.py` should look like this:

```python
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

And in `config/__init__.py`:

```python
from .celery import app as celery_app

__all__ = ("celery_app",)
```

In `settings.py`:

```python
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://localhost:6379/1")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
```

---

# ▶️ Running the Server

```bash
python manage.py runserver
```

Backend runs on:

```
http://localhost:8000
```

---

# 🔐 Authentication

This project uses **JWT authentication via SimpleJWT**.

## Obtain Token

```http
POST /api/auth/token/
```

Returns:

```json
{
  "access": "...",
  "refresh": "..."
}
```

## Refresh Token

```http
POST /api/auth/token/refresh/
```

* Refresh tokens rotate
* Old tokens are blacklisted automatically

All protected routes require:

```
Authorization: Bearer <access_token>
```

---

# 🌍 CORS

CORS is configured to allow:

```
http://localhost:3000
```

For Next.js frontend development.

To add more origins:

```env
CORS_ALLOWED_ORIGINS=https://yourfrontend.com
```

---

# 🔑 Google OAuth

Configure credentials in `.env`.

Redirect URI must match:

```
http://localhost:8000/api/auth/google/callback/
```

Make sure it is registered in your Google Cloud Console.

---

# 📡 WebSub Support

Callback URL:

```
/api/channels/websub/callback/
```

Ensure this endpoint is publicly accessible in production.

---

# 📁 Project Structure

```
apps/
 ├── accounts      # Custom user model (Creator)
 ├── channels
 ├── episodes
 ├── feeds
 ├── analytics     # RSS tracking middleware
 └── billing
```

Custom User Model:

```python
AUTH_USER_MODEL = "accounts.Creator"
```

---

# 📊 Rate Limiting

Configured in DRF:

* Anonymous: `60/minute`
* Authenticated: `300/minute`

---

# 🧪 Running Tests

```bash
python manage.py test
```

---

# 🏗 Production Notes

Before deploying:

* Set `DEBUG=False`
* Set a strong `SECRET_KEY`
* Configure proper `ALLOWED_HOSTS`
* Use a production Redis instance
* Use a production PostgreSQL database
* Switch email backend from console to SMTP
* Serve static files properly (e.g., with WhiteNoise or S3)
* Use HTTPS (required for OAuth + secure cookies)
* Run Celery worker and beat as separate systemd services or supervised Docker containers
* Set `CELERY_TASK_ALWAYS_EAGER=False` in production
* Monitor tasks via Flower or integrate with a logging/alerting service

---

# 🧠 Tech Stack

* Django
* Django REST Framework
* SimpleJWT
* Celery + django-celery-beat
* PostgreSQL
* Redis
* CORS Headers