#!/usr/bin/env bash
set -euo pipefail

SFTP_HOST="interventiodev.sftp.wpengine.com"
SFTP_PORT="2222"
SFTP_USER="interventiodev-kp0809"
REMOTE_DIR="wp-content/uploads/v2/intervention-v2-wordpress"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ── 1. Build ─────────────────────────────────────────────────────────────────
echo "==> Building for WordPress..."
cd "$PROJECT_DIR"
npm run build:wp
echo "==> Build succeeded."

# ── 2. Credentials ───────────────────────────────────────────────────────────
echo ""
read -s -p "SFTP password for $SFTP_USER: " PASS
echo ""

# ── 3. Upload ─────────────────────────────────────────────────────────────────
if ! command -v lftp &>/dev/null; then
  echo "lftp not found. Install with: brew install lftp"
  exit 1
fi

echo "==> Uploading to WP Engine (sync with --delete)..."
lftp -p "$SFTP_PORT" -u "$SFTP_USER,$PASS" "sftp://$SFTP_HOST" <<EOF
mirror -R --delete "$PROJECT_DIR/out" "$REMOTE_DIR"
bye
EOF

echo ""
echo "==> Done. Verify at:"
echo "    https://interventiodev.wpenginepowered.com/$REMOTE_DIR/index.html"
