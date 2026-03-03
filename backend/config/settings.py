"""
Django settings.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "hRjeuLVTpfMZZqfKc4cMuOxQueNUmIWP3TNkHMpp1xsq7n4zKpLEm3y0zfZqiqZU__Y")

DEBUG = os.environ.get("DEBUG", "True") == "True"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost 127.0.0.1").split()


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # enables logout via token blacklisting
    "corsheaders",
    # Local apps
    "apps.accounts",
    "apps.channels",
    "apps.episodes",
    "apps.feeds",
    "apps.analytics",
    "apps.billing",
]


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",             # must be before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.analytics.middleware.RSSAnalyticsMiddleware",  # logs RSS feed requests
]

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ---------------------------------------------------------------------------
# Database — PostgreSQL
# ---------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME":     os.environ.get("DB_NAME",     "audiosync"),
        "USER":     os.environ.get("DB_USER",     "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
        "HOST":     os.environ.get("DB_HOST",     "localhost"),
        "PORT":     os.environ.get("DB_PORT",     "5432"),
        "OPTIONS": {
            "connect_timeout": 10,
        },
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# Cache — local memory (Redis removed for local dev)
# ---------------------------------------------------------------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Sessions — database backend (default)
SESSION_ENGINE = "django.contrib.sessions.backends.db"


# ---------------------------------------------------------------------------
# Custom User Model
# ---------------------------------------------------------------------------
AUTH_USER_MODEL = "accounts.Creator"


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "300/minute",
    },
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
}


# ---------------------------------------------------------------------------
# JWT — Simple JWT
# ---------------------------------------------------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":          timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME":         timedelta(days=7),
    "ROTATE_REFRESH_TOKENS":          True,    # issues new refresh token on every refresh
    "BLACKLIST_AFTER_ROTATION":       True,    # old refresh token is blacklisted
    "UPDATE_LAST_LOGIN":              True,
    "ALGORITHM":                      "HS256",
    "SIGNING_KEY":                    os.environ.get("SECRET_KEY", "hRjeuLVTpfMZZqfKc4cMuOxQueNUmIWP3TNkHMpp1xsq7n4zKpLEm3y0zfZqiqZU__Y"),
    "AUTH_HEADER_TYPES":              ("Bearer",),
    "AUTH_HEADER_NAME":               "HTTP_AUTHORIZATION",
    "USER_ID_FIELD":                  "id",
    "USER_ID_CLAIM":                  "user_id",
    "TOKEN_OBTAIN_SERIALIZER":        "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER":       "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
}


# ---------------------------------------------------------------------------
# CORS — allow requests from the Next.js frontend
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000",
).split()

CORS_ALLOW_CREDENTIALS = True   # needed so the browser sends the Authorization header

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "x-csrftoken",
    "x-requested-with",
]


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------
GOOGLE_OAUTH_CLIENT_ID     = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", "")
GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", "")
GOOGLE_OAUTH_REDIRECT_URI  = os.environ.get(
    "GOOGLE_OAUTH_REDIRECT_URI",
    "http://localhost:8000/api/auth/google/callback/",
)
GOOGLE_OAUTH_CLIENT_CONFIG = {
    "web": {
        "client_id":     GOOGLE_OAUTH_CLIENT_ID,
        "client_secret": GOOGLE_OAUTH_CLIENT_SECRET,
        "auth_uri":      "https://accounts.google.com/o/oauth2/auth",
        "token_uri":     "https://oauth2.googleapis.com/token",
        "redirect_uris": [GOOGLE_OAUTH_REDIRECT_URI],
    }
}

# =============================================================================
# Polar.sh API Keys
# =============================================================================

POLAR_ACCESS_TOKEN    = os.environ.get("POLAR_ACCESS_TOKEN", "")
POLAR_WEBHOOK_SECRET  = os.environ.get("POLAR_WEBHOOK_SECRET", "")
POLAR_PRODUCT_STARTER = os.environ.get("POLAR_PRODUCT_STARTER", "")
POLAR_PRODUCT_PRO     = os.environ.get("POLAR_PRODUCT_PRO", "")
POLAR_PRODUCT_AGENCY  = os.environ.get("POLAR_PRODUCT_AGENCY", "")


# ---------------------------------------------------------------------------
# WebSub / PubSubHubbub
# ---------------------------------------------------------------------------
WEBSUB_CALLBACK_URL = os.environ.get(
    "WEBSUB_CALLBACK_URL",
    "http://localhost:8000/api/channels/websub/callback/",
)


# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------
EMAIL_BACKEND       = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",  # prints to console in dev
)
EMAIL_HOST          = os.environ.get("EMAIL_HOST", "smtp.sendgrid.net")
EMAIL_PORT          = int(os.environ.get("EMAIL_PORT", 587))
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = os.environ.get("EMAIL_HOST_USER", "apikey")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL  = os.environ.get("DEFAULT_FROM_EMAIL", "hello@podcastifyyt.com")


# ---------------------------------------------------------------------------
# Password validation (kept for admin users)
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE     = "UTC"
USE_I18N      = True
USE_TZ        = True


# ---------------------------------------------------------------------------
# Static & Media files
# ---------------------------------------------------------------------------
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL   = "/media/"
MEDIA_ROOT  = BASE_DIR / "mediafiles"


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name}: {message}",
            "style":  "{",
        },
    },
    "handlers": {
        "console": {
            "class":     "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level":    "INFO",
    },
    "loggers": {
        "django":         {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "apps.accounts":  {"handlers": ["console"], "level": "DEBUG",   "propagate": False},
        "apps.channels":  {"handlers": ["console"], "level": "DEBUG",   "propagate": False},
        "apps.episodes":  {"handlers": ["console"], "level": "DEBUG",   "propagate": False},
        "tasks":          {"handlers": ["console"], "level": "DEBUG",   "propagate": False},
    },
}