const { withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withReceiptReader = (config) => {
  return withXcodeProject(config, async (config) => {
    const { projectRoot, platformProjectRoot } = config.modRequest;
    const xcodeProject = config.modResults;
    
    // Source files
    const nativeModulesDir = path.join(projectRoot, 'ios-native-modules');
    const swiftFile = 'ReceiptReader.swift';
    const objcFile = 'ReceiptReader.m';
    
    // Add files to Xcode project if they exist
    if (fs.existsSync(path.join(nativeModulesDir, swiftFile))) {
      xcodeProject.addSourceFile(swiftFile, {}, xcodeProject.getFirstTarget().uuid);
    }
    if (fs.existsSync(path.join(nativeModulesDir, objcFile))) {
      xcodeProject.addSourceFile(objcFile, {}, xcodeProject.getFirstTarget().uuid);
    }
    
    return config;
  });
};

module.exports = withReceiptReader;
