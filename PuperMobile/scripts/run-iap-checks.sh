#!/usr/bin/env zsh
# Runs both receipt verification helper scripts to provide a quick automated health check
# for the Supabase Edge Functions backing IAP validation.
#
# Required env (shared):
#   SUPABASE_URL, SUPABASE_ANON_KEY
#
# iOS-specific env:
#   - Provide either RECEIPT_DATA (base64) or RECEIPT_FILE pointing to a file containing it.
#   - Optional USER_ID is forwarded to the function.
#   - VERIFY_IOS_ENDPOINT can override the default /functions/v1/verify_ios_receipt URL (useful for mocks).
#
# Android-specific env:
#   - PRODUCT_ID, PURCHASE_TOKEN (purchaseToken/token from Play billing)
#   - PACKAGE_NAME or ANDROID_PACKAGE_NAME Supabase secret (PACKAGE_NAME env takes precedence here)
#   - VERIFY_ANDROID_ENDPOINT can override the default /functions/v1/android_receipts URL.
#
# Skipping:
#   - Set SKIP_IOS_CHECK=1 or SKIP_ANDROID_CHECK=1 to bypass a platform.
#   - If required env vars are missing for one platform, that check is skipped with a warning.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${(%):-%N}")" && pwd)"
IOS_SCRIPT="$SCRIPT_DIR/verify-ios-receipt.sh"
ANDROID_SCRIPT="$SCRIPT_DIR/verify-android-receipt.sh"

if [[ ! -x "$IOS_SCRIPT" || ! -x "$ANDROID_SCRIPT" ]]; then
  echo "Receipt helper scripts must be executable. Run chmod +x scripts/verify-*-receipt.sh" >&2
  exit 1
fi

overall_status=0

run_ios() {
  if [[ "${SKIP_IOS_CHECK:-0}" == "1" ]]; then
    echo "[IAP][iOS] Skipped (SKIP_IOS_CHECK=1)"
    return
  fi

  if [[ -z "${RECEIPT_DATA:-}" && -z "${RECEIPT_FILE:-}" ]]; then
    echo "[IAP][iOS] Skipped (provide RECEIPT_DATA or RECEIPT_FILE)" >&2
    return
  fi

  echo "[IAP][iOS] Running verify-ios-receipt.sh"
  if "$IOS_SCRIPT"; then
    echo "[IAP][iOS] ✅ Passed"
  else
    echo "[IAP][iOS] ❌ Failed" >&2
    overall_status=1
  fi
}

run_android() {
  if [[ "${SKIP_ANDROID_CHECK:-0}" == "1" ]]; then
    echo "[IAP][Android] Skipped (SKIP_ANDROID_CHECK=1)"
    return
  fi

  if [[ -z "${PRODUCT_ID:-}" || -z "${PURCHASE_TOKEN:-}" ]]; then
    echo "[IAP][Android] Skipped (set PRODUCT_ID and PURCHASE_TOKEN)" >&2
    return
  fi

  if [[ -z "${PACKAGE_NAME:-}" && -z "${ANDROID_PACKAGE_NAME:-}" ]]; then
    echo "[IAP][Android] Skipped (set PACKAGE_NAME or ANDROID_PACKAGE_NAME)" >&2
    return
  fi

  echo "[IAP][Android] Running verify-android-receipt.sh"
  if "$ANDROID_SCRIPT"; then
    echo "[IAP][Android] ✅ Passed"
  else
    echo "[IAP][Android] ❌ Failed" >&2
    overall_status=1
  fi
}

run_ios
run_android

exit $overall_status
