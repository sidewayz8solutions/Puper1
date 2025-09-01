#!/bin/bash

# Custom framework embedding script to avoid sandbox issues

set -e

FRAMEWORKS_DIR="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
mkdir -p "${FRAMEWORKS_DIR}"

# Copy Capacitor framework
if [ -d "${BUILT_PRODUCTS_DIR}/Capacitor/Capacitor.framework" ]; then
    echo "Copying Capacitor.framework"
    cp -R "${BUILT_PRODUCTS_DIR}/Capacitor/Capacitor.framework" "${FRAMEWORKS_DIR}/"
    
    # Remove headers and modules to reduce size
    rm -rf "${FRAMEWORKS_DIR}/Capacitor.framework/Headers" 2>/dev/null || true
    rm -rf "${FRAMEWORKS_DIR}/Capacitor.framework/Modules" 2>/dev/null || true
    rm -rf "${FRAMEWORKS_DIR}/Capacitor.framework/PrivateHeaders" 2>/dev/null || true
    
    # Code sign the framework
    codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements "${FRAMEWORKS_DIR}/Capacitor.framework" 2>/dev/null || true
fi

# Copy CapacitorCordova framework
if [ -d "${BUILT_PRODUCTS_DIR}/CapacitorCordova/Cordova.framework" ]; then
    echo "Copying Cordova.framework"
    cp -R "${BUILT_PRODUCTS_DIR}/CapacitorCordova/Cordova.framework" "${FRAMEWORKS_DIR}/"
    
    # Remove headers and modules to reduce size
    rm -rf "${FRAMEWORKS_DIR}/Cordova.framework/Headers" 2>/dev/null || true
    rm -rf "${FRAMEWORKS_DIR}/Cordova.framework/Modules" 2>/dev/null || true
    rm -rf "${FRAMEWORKS_DIR}/Cordova.framework/PrivateHeaders" 2>/dev/null || true
    
    # Code sign the framework
    codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements "${FRAMEWORKS_DIR}/Cordova.framework" 2>/dev/null || true
fi

echo "Framework embedding completed successfully"
