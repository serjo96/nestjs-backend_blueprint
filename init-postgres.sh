#!/bin/bash
set -e;
chmod +x /docker-entrypoint-initdb.d/init-data.sh


INIT_DB_SQL="/docker-entrypoint-initdb.d/init-db.sql"

if [ -n "${DB_USER}" ] && [ -n "${DB_DATABASE}" ]; then

  until pg_isready --quiet; do
    echo "Waiting PostgreSQL running..."
    sleep 1
  done

  # Check existing db
  if [ -z "$(psql -qtAX --dbname="${DB_DATABASE}" -c "SELECT datname FROM pg_database WHERE datname='${DB_DATABASE}'")" ]; then
    echo "Creating database: ${DB_DATABASE}"
    createdb -E UTF8 "${DB_DATABASE}"
  fi

  # Check existing user
  if [ -z "$(psql -qtAX --dbname=postgres -c "SELECT usename FROM pg_user WHERE usename='$DB_USER'")" ]; then
    echo "Creating user: '$DB_USER'"
    createuser --createdb --login --password "$DB_USER"
  fi

  # Init db scripts if its exist
  if [ -f "$INIT_DB_SQL" ]; then
    echo "Initializing database"
    psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "DB_DATABASE" < "$INIT_DB_SQL"
  fi
else
        echo "SETUP INFO: No Environment variables given!"
fi
