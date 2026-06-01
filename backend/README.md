# 🎙 Opticast – Backend (Django API)

Backend API for Opticast built with **Django + Django REST Framework**, using:

- PostgreSQL (Database)
- PostgreSQL (Database)
- Inngest (Background jobs & Durable execution)
- JWT Authentication (SimpleJWT with refresh rotation)
- Google OAuth
- WebSub (PubSubHubbub)
- CORS support for Next.js frontend

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
DB_NAME=opticast
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Inngest
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=
INNGEST_APP_ID=Opticast

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
DEFAULT_FROM_EMAIL=hello@opticast.com
```

---

# 🗄 Database Setup (PostgreSQL)

Make sure PostgreSQL is running.

Create database:

```sql
CREATE DATABASE opticast;
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

# ⚡ Inngest Setup

Opticast uses Inngest for background jobs such as audio processing, WebSub notifications, feed generation, and analytics aggregation. Inngest provides durable execution and automatic retries.

---

## 🖥 Running Inngest Locally

Make sure your virtual environment is active and the backend is running.

### Start the Inngest Dev Server

```bash
npx inngest-cli@latest dev
```

The Dev Server provides a UI at [http://localhost:8288](http://localhost:8288) where you can inspect events and function runs.

### Environment Variable

Set `INNGEST_DEV=1` in your `.env` so the SDK connects to the local Dev Server.

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
            POSTGRES_DB: opticast
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres
        ports:
            - "5432:5432"
        volumes:
            - postgres_data:/var/lib/postgresql/data

    inngest:
        image: inngest/inngest
        ports:
            - "8288:8288"
        command: -u http://web:8000/api/inngest/

volumes:
    postgres_data:
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

- Refresh tokens rotate
- Old tokens are blacklisted automatically

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

- Anonymous: `60/minute`
- Authenticated: `300/minute`

---

# 🧪 Running Tests

```bash
python manage.py test
```

---

# 🏗 Production Notes

Before deploying:

- Set `DEBUG=False`
- Set a strong `SECRET_KEY`
- Configure proper `ALLOWED_HOSTS`
- Use a production Redis instance
- Use a production PostgreSQL database
- Switch email backend from console to SMTP
- Serve static files properly (e.g., with WhiteNoise or S3)
- Use HTTPS (required for OAuth + secure cookies)
- Run Celery worker and beat as separate systemd services or supervised Docker containers
- Set `CELERY_TASK_ALWAYS_EAGER=False` in production
- Monitor tasks via Flower or integrate with a logging/alerting service

---

# 🧠 Tech Stack

- Django
- Django REST Framework
- SimpleJWT
- Inngest + django-inngest
- PostgreSQL
- CORS Headers
