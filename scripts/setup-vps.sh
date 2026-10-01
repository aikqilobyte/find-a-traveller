#!/usr/bin/env bash
# =====================================================================
# One-shot VPS setup for Find A Traveller.
#
# Safe by design. It only ever ADDS things:
#   - a new systemd service for this app
#   - a new nginx site file for app.tripshipr.com
#
# It never edits the existing site's nginx config, and if its own config
# fails validation it removes itself and stops before reloading nginx —
# so a broken config here can never take the live site down.
#
# Run with:  bash scripts/setup-vps.sh
# =====================================================================
set -euo pipefail

APP_DIR="$HOME/find-a-traveller"
DOMAIN="app.tripshipr.com"
PORT=3000
SERVICE=find-a-traveller
NGINX_SITE=tripshipr-app

cd "$APP_DIR"

if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found in $APP_DIR"
  echo "Copy it from your PC first:"
  echo "    scp .env.local aik@76.13.216.191:find-a-traveller/"
  exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
  echo "ERROR: .env.local does not look right — no Supabase URL in it."
  exit 1
fi

# The site URL has to match where this is actually served, or auth
# emails will send people back to the old host.
sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://app.tripshipr.com|' .env.local
if ! grep -q "NEXT_PUBLIC_SITE_URL" .env.local; then
  echo "NEXT_PUBLIC_SITE_URL=https://app.tripshipr.com" >> .env.local
fi
echo "Site URL set to: $(grep NEXT_PUBLIC_SITE_URL .env.local)"
echo

echo "=== 1/6  Installing dependencies — 3 to 5 minutes, lots of output ==="
npm ci

echo
echo "=== 2/6  Building — 2 to 4 minutes ==="
npm run build

echo
echo "=== 3/6  Creating the background service ==="
NPM_BIN="$(command -v npm)"
sudo tee /etc/systemd/system/${SERVICE}.service > /dev/null <<UNIT
[Unit]
Description=Find A Traveller (Next.js)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
ExecStart=$NPM_BIN run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now ${SERVICE}

echo
echo "=== 4/6  Waiting for the app to answer on port ${PORT} ==="
UP=0
for _ in $(seq 1 25); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT}"; then UP=1; break; fi
  sleep 2
done

if [ "$UP" -ne 1 ]; then
  echo "The app did not start. Recent log:"
  sudo journalctl -u ${SERVICE} -n 40 --no-pager
  exit 1
fi
echo "App is running."

echo
echo "=== 5/6  Adding the nginx site (a NEW file — nothing existing is edited) ==="
sudo tee /etc/nginx/sites-available/${NGINX_SITE} > /dev/null <<'NGINX'
server {
    listen 80;
    server_name app.tripshipr.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/${NGINX_SITE}

echo
echo "=== 6/6  Validating nginx BEFORE reloading ==="
if sudo nginx -t; then
  sudo systemctl reload nginx
  echo
  echo "=========================================="
  echo " DONE.  Open:  http://${DOMAIN}"
  echo
  echo " For https, run:"
  echo "   sudo certbot --nginx -d ${DOMAIN}"
  echo "=========================================="
else
  sudo rm -f /etc/nginx/sites-enabled/${NGINX_SITE}
  echo
  echo "nginx config did not validate, so it was removed and nginx was"
  echo "NOT reloaded. The live site is completely unaffected."
  exit 1
fi
