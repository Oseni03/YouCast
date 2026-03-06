#!/bin/bash

# Wait for database
if [ "$DB_HOST" = "db" ]; then
    echo "Waiting for postgres..."
    while ! curl -s http://db:5432 > /dev/null; do
      sleep 1
    done
    echo "Postgres started"
fi

# Apply migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Start server
echo "Starting server..."
if [ "$DEBUG" = "True" ]; then
    python manage.py runserver 0.0.0.0:8000
else
    # Collect static files for production
    python manage.py collectstatic --noinput
    gunicorn config.wsgi:application --bind 0.0.0.0:8000
fi
