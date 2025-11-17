#!/usr/bin/env node
/**
 * EAS Build Prebuild Hook - Setup iOS Receipt Reader Module
 * This script runs during EAS Build after expo prebuild
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Setting up iOS Receipt Reader module...');

const projectRoot = process.cwd();
const iosDir = path.join(projectRoot, 'ios');

// Check if ios directory exists (created by expo prebuild)
if (!fs.existsSync(iosDir)) {
  console.log('⏭️  iOS directory not found, skipping native module setup');
  process.exit(0);
}

// Find the app target directory
const iosDirContents = fs.readdirSync(iosDir);
const appDir = iosDirContents.find(name => !name.startsWith('.') && fs.statSync(path.join(iosDir, name)).isDirectory() && name !== 'Pods');

if (!appDir) {
  console.error('❌ Could not find iOS app directory');
  process.exit(1);
}

const targetDir = path.join(iosDir, appDir);
console.log(`✅ Found iOS app directory: ${appDir}`);

// Copy native module files
const sourceDir = path.join(projectRoot, 'ios-native-modules');
const files = ['ReceiptReader.swift', 'ReceiptReader.m'];

let copiedCount = 0;
for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied ${file} to ${targetDir}`);
    copiedCount++;
  } else {
    console.warn(`⚠️  Source file not found: ${sourcePath}`);
  }
}

if (copiedCount === files.length) {
  console.log('✅ iOS Receipt Reader module setup complete!');
  
  // Add files to Xcode project using xcode npm package
  try {
    const xcode = require('xcode');
    const pbxprojPath = path.join(iosDir, appDir + '.xcodeproj', 'project.pbxproj');
    
    if (fs.existsSync(pbxprojPath)) {
      const project = xcode.project(pbxprojPath);
      project.parseSync();
      
      // Add source files to project
      project.addSourceFile('ReceiptReader.swift');
      project.addSourceFile('ReceiptReader.m');
      
      fs.writeFileSync(pbxprojPath, project.writeSync());
      console.log('✅ Added files to Xcode project');
    }
  } catch (err) {
    console.warn('⚠️  Could not modify Xcode project (non-fatal):', err.message);
  }
} else {
  console.error(`❌ Only copied ${copiedCount}/${files.length} files`);
  process.exit(1);
}
