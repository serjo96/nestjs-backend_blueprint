#!/bin/bash
set -e;
chmod +x /docker-entrypoint-initdb.d/init-data.sh


INIT_DB_SQL="/docker-entrypoint-initdb.d/init-db.sql"

if [ -n "${POSTGRES_USER}" ] && [ -n "${POSTGRES_DB}" ]; then

  until pg_isready --quiet; do
    echo "Ждем PostgreSQL запустится..."
    sleep 1
  done

  # Проверка на существование базы данных
  if [ -z "$(psql -qtAX --dbname="${POSTGRES_DB}" -c "SELECT datname FROM pg_database WHERE datname='${POSTGRES_DB}'")" ]; then
    echo "Creating database: ${POSTGRES_DB}"
    createdb -E UTF8 "${POSTGRES_DB}"
  fi

  # Проверка на существование пользователя базы данных
  if [ -z "$(psql -qtAX --dbname=postgres -c "SELECT usename FROM pg_user WHERE usename='$POSTGRES_USER'")" ]; then
    echo "Creating user: '$POSTGRES_USER'"
    createuser --createdb --login --password "$POSTGRES_USER"
  fi

  # Инициализация базы данных, если инициализационный SQL-скрипт существует
  if [ -f "$INIT_DB_SQL" ]; then
    echo "Initializing database"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "POSTGRES_DB" < "$INIT_DB_SQL"
  fi
else
        echo "SETUP INFO: No Environment variables given!"
fi
