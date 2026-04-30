#!/bin/sh
set -e

mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS fundmonitoringnew;"
mysql -u root -p"$MYSQL_ROOT_PASSWORD" fundmonitoringnew < /docker-entrypoint-initdb.d/fundmonitoringnew_backup.sql
