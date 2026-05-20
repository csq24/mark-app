#!/usr/bin/env bash
# Poll Mark App dev server every 20s. Run in a dedicated terminal:
#   bash scripts/health-check.sh
set -euo pipefail
BASE_URL="${MARK_APP_URL:-http://localhost:5173}"
INTERVAL="${HEALTH_INTERVAL_SEC:-20}"

check() {
  local path="$1"
  local label="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" || echo "000")
  if [[ "$code" == "200" ]]; then
    echo "[$(date +%H:%M:%S)] OK  $label ($code)"
    return 0
  fi
  echo "[$(date +%H:%M:%S)] FAIL $label ($code) — ${BASE_URL}${path}"
  return 1
}

echo "Health check → $BASE_URL every ${INTERVAL}s (Ctrl+C to stop)"
while true; do
  failed=0
  check "/" "/map redirect" || failed=1
  check "/login" "login page" || failed=1
  if [[ $failed -ne 0 ]]; then
    echo "  → Restart: cd mark-app && npm run dev"
  fi
  sleep "$INTERVAL"
done
