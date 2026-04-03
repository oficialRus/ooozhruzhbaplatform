#!/usr/bin/env bash
set -euo pipefail

DOMAIN="ooo-druzhba.ru"
WEB_ROOT="/var/www/${DOMAIN}/html"
BACKEND_BIN="/opt/ooozhruzhbaplatform/bin/ooozhruzhbaplatform-backend"
BACKEND_DATA_DIR="/opt/ooozhruzhbaplatform/data"
SERVICE="ooozhruzhbaplatform-backend.service"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUDO=""
if [[ "$(id -u)" -ne 0 ]]; then
  SUDO="sudo"
fi

echo "== Build frontend =="
cd "${SCRIPT_DIR}/frontend"
npm ci --no-audit --no-fund
npm run build

echo "== Deploy frontend (static SPA) =="
# Чистим папку, включая dot-файлы, но НЕ трогаем '.' и '..'
rm -rf "${WEB_ROOT:?}/"* "${WEB_ROOT:?}/".[!.]* "${WEB_ROOT:?}/"..?*
cp -a "${SCRIPT_DIR}/frontend/dist/." "${WEB_ROOT}/"

echo "== Build backend (Go) =="
cd "${SCRIPT_DIR}/backend"
go build -o "${BACKEND_BIN}" ./cmd/server

echo "== Prepare backend data dir =="
${SUDO} mkdir -p "${BACKEND_DATA_DIR}"
${SUDO} chown -R www-data:www-data "${BACKEND_DATA_DIR}"

echo "== Restart backend service =="
${SUDO} systemctl restart "${SERVICE}"

echo "== Reload nginx =="
${SUDO} systemctl reload nginx

echo "OK: site updated for ${DOMAIN}"

