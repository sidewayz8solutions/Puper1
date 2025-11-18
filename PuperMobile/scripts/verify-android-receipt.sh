#!/usr/bin/env zsh
# Simple test script for the Supabase Edge Function android_receipts
# Verifies a Google Play in-app product purchase token.
# Usage:
#   export SUPABASE_URL="https://qunaiicjcelvdunluwqh.supabase.co"
#   export SUPABASE_ANON_KEY="<anon-or-service-role-key>"
#   export PRODUCT_ID="com.sidewayz8.puper.ads"
#   export PURCHASE_TOKEN="<play_purchase_token>"
#   # Optional if not set as secret ANDROID_PACKAGE_NAME in Supabase:
#   export PACKAGE_NAME="com.sidewayz8.puper"
#   ./scripts/verify-android-receipt.sh
#
# Notes:
# - For production entitlement checks use a service-role key (secure server side) NOT the anon key.
# - This script is for manual diagnostics; do not ship it in a client app.
# - PURCHASE_TOKEN comes from react-native-iap purchase event (purchaseToken/token).

set -euo pipefail

if [[ -z "${SUPABASE_URL:-}" || -z "${SUPABASE_ANON_KEY:-}" ]]; then
  echo "SUPABASE_URL and SUPABASE_ANON_KEY must be set" >&2
  exit 1
fi
if [[ -z "${PRODUCT_ID:-}" || -z "${PURCHASE_TOKEN:-}" ]]; then
  echo "PRODUCT_ID and PURCHASE_TOKEN must be set" >&2
  exit 1
fi

EFFECTIVE_PACKAGE="${PACKAGE_NAME:-${ANDROID_PACKAGE_NAME:-}}"
if [[ -z "$EFFECTIVE_PACKAGE" ]]; then
  echo "PACKAGE_NAME or ANDROID_PACKAGE_NAME must be set" >&2
  exit 1
fi

FUNCTION_PATH="/functions/v1/android_receipts"
URL="${VERIFY_ANDROID_ENDPOINT:-${SUPABASE_URL%/}${FUNCTION_PATH}}"

payload=$(jq -n \
  --arg productId "$PRODUCT_ID" \
  --arg purchaseToken "$PURCHASE_TOKEN" \
  --arg packageName "$EFFECTIVE_PACKAGE" \
  '{ productId: $productId, purchaseToken: $purchaseToken } + (if $packageName != "" then { packageName: $packageName } else {} end)')

echo "POST $URL" >&2

http_code=$(curl -s -o /tmp/android_receipt_resp.json -w '%{http_code}' \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -X POST "$URL" \
  -d "$payload")

echo "HTTP $http_code" >&2

if [[ "$http_code" != 200 && "$http_code" != 400 ]]; then
  echo "Unexpected status. Raw response:" >&2
  cat /tmp/android_receipt_resp.json >&2
  exit 1
fi

jq '.' /tmp/android_receipt_resp.json 2>/dev/null || cat /tmp/android_receipt_resp.json

# Highlight validity quickly
valid=$(jq -r '.valid // empty' /tmp/android_receipt_resp.json 2>/dev/null || true)
if [[ -n "$valid" ]]; then
  if [[ "$valid" == "true" ]]; then
    echo "Result: VALID purchase" >&2
  else
    echo "Result: NOT VALID (purchaseState != 0)" >&2
  fi
fi
