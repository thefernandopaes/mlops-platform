#!/usr/bin/env sh
set -e

# Run migrations
if [ -n "$DATABASE_URL" ]; then
  echo "Running migrations..."
  alembic upgrade head
else
  echo "DATABASE_URL not set; skipping migrations"
fi

HOST="0.0.0.0"
PORT="8000"
WORKERS=${WORKERS:-$(python - <<'PY'
import os, multiprocessing as mp
print(max(2, mp.cpu_count()))
PY
)}

echo "Starting server with gunicorn ($WORKERS workers)"
exec gunicorn app.main:app \
  --workers "$WORKERS" \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "$HOST:$PORT" \
  --timeout 60 \
  --graceful-timeout 30 \
  --log-level ${LOG_LEVEL:-info}


