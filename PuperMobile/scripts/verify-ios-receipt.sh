#!/usr/bin/env zsh
# Simple test script for the Supabase Edge Function verify_ios_receipt
# Verifies an Apple in-app purchase receipt blob (base64 string).
# Usage:
#   export SUPABASE_URL="https://pbyqkxhqrahjqjvnorwn.supabase.co"
#   export SUPABASE_ANON_KEY="<anon-or-service-role-key>"
#   export RECEIPT_DATA="$(cat receipt.txt)"   # base64 string from Apple
#   # Optional:
#   export USER_ID="abc123"
#   ./scripts/verify-ios-receipt.sh
#
# Alternatively, point RECEIPT_FILE to a text file that contains the base64 blob:
#   export RECEIPT_FILE="~/Downloads/latest_receipt.txt"
#   ./scripts/verify-ios-receipt.sh
#
# Notes:
# - For production checks prefer a service-role key and never expose it in clients.
# - Receipts are base64 strings from react-native-iap's purchase.transactionReceipt.
# - This script is for manual diagnostics only.

set -euo pipefail

expand_path() {
  local input="$1"
  if [[ -z "$input" ]]; then
    return 1
  fi
  if [[ "$input" == ~* ]]; then
    printf '%s\n' "${input/#\~/$HOME}"
  else
    printf '%s\n' "$input"
  fi
}

if [[ -z "${SUPABASE_URL:-}" || -z "${SUPABASE_ANON_KEY:-}" ]]; then
  echo "SUPABASE_URL and SUPABASE_ANON_KEY must be set" >&2
  exit 1
fi

if [[ -z "${RECEIPT_DATA:-}" ]]; then
  if [[ -n "${RECEIPT_FILE:-}" ]]; then
    RECEIPT_FILE_RESOLVED=$(expand_path "$RECEIPT_FILE")
    if [[ ! -f "$RECEIPT_FILE_RESOLVED" ]]; then
      echo "RECEIPT_FILE '$RECEIPT_FILE' not found" >&2
      exit 1
    fi
    RECEIPT_DATA=$(tr -d '\n' <"$RECEIPT_FILE_RESOLVED")
  else
    echo "Provide RECEIPT_DATA or RECEIPT_FILE" >&2
    exit 1
  fi
fi

if [[ -z "$RECEIPT_DATA" ]]; then
  echo "receipt data resolved to an empty string" >&2
  exit 1
fi

FUNCTION_PATH="/functions/v1/verify_ios_receipt"
URL="${VERIFY_IOS_ENDPOINT:-${SUPABASE_URL%/}${FUNCTION_PATH}}"

payload=$(jq -n \
  --arg receiptData "$RECEIPT_DATA" \
  --arg userId "${USER_ID:-}" \
  '{ receiptData: $receiptData } + (if $userId != "" then { userId: $userId } else {} end)')

echo "POST $URL" >&2

http_code=$(curl -s -o /tmp/ios_receipt_resp.json -w '%{http_code}' \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -X POST "$URL" \
  -d "$payload")

echo "HTTP $http_code" >&2

if [[ "$http_code" != 200 && "$http_code" != 400 ]]; then
  echo "Unexpected status. Raw response:" >&2
  cat /tmp/ios_receipt_resp.json >&2
  exit 1
fi

jq '.' /tmp/ios_receipt_resp.json 2>/dev/null || cat /tmp/ios_receipt_resp.json

valid=$(jq -r '.valid // empty' /tmp/ios_receipt_resp.json 2>/dev/null || true)
if [[ -n "$valid" ]]; then
  if [[ "$valid" == "true" ]]; then
    echo "Result: VALID receipt" >&2
  else
    echo "Result: INVALID receipt" >&2
  fi
fi

has_remove_ads=$(jq -r '.hasRemoveAds // empty' /tmp/ios_receipt_resp.json 2>/dev/null || true)
if [[ -n "$has_remove_ads" ]]; then
  if [[ "$has_remove_ads" == "true" ]]; then
    echo "Entitlement: Remove Ads ACTIVE" >&2
  else
    echo "Entitlement: Remove Ads NOT FOUND" >&2
  fi
fi
