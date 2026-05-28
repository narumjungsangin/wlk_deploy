#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-wlk_user}"
DB_PASS="${DB_PASS:-wlk_password}"
DB_NAME="${DB_NAME:-wlk_db}"

echo "Running DB migrations..."
mariadb -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < /app/prisma/migrations/20260101000000_init/migration.sql 2>/dev/null || true

echo "Seeding initial data..."
mariadb -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  < /app/prisma/seed-data.sql 2>/dev/null || true

echo "Starting app..."
exec node server.js
