#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const iosDir = path.join(__dirname, '..', 'ios');
const nativeModulesDir = path.join(__dirname, '..', 'ios-native-modules');

// Check if ios directory exists (it won't in managed workflow until prebuild)
if (!fs.existsSync(iosDir)) {
  console.log('⚠️  iOS directory not found - will be added during EAS build');
  process.exit(0);
}

// Find the app target directory
const iosContents = fs.readdirSync(iosDir);
const appDir = iosContents.find(name => 
  name.endsWith('.xcodeproj') === false && 
  name !== 'Pods' && 
  fs.statSync(path.join(iosDir, name)).isDirectory()
);

if (!appDir) {
  console.log('⚠️  Could not find iOS app directory');
  process.exit(0);
}

const targetDir = path.join(iosDir, appDir);

// Copy Swift and Objective-C files
const filesToCopy = ['ReceiptReader.swift', 'ReceiptReader.m'];

filesToCopy.forEach(file => {
  const source = path.join(nativeModulesDir, file);
  const dest = path.join(targetDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copied ${file} to iOS project`);
  }
});

console.log('✅ iOS native modules installed');
