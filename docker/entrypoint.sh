#!/bin/sh
set -eu

mkdir -p /app/storage/reports
chown -R node:node /app/storage

exec gosu node "$@"
