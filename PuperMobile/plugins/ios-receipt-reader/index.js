const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withReceiptReader = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const { platformProjectRoot } = config.modRequest;
      const projectName = path.basename(platformProjectRoot);
      
      // Copy Swift file
      const swiftSource = path.join(__dirname, 'ios', 'ReceiptReader.swift');
      const swiftDest = path.join(platformProjectRoot, projectName, 'ReceiptReader.swift');
      fs.copyFileSync(swiftSource, swiftDest);
      
      // Copy Objective-C bridge
      const objcSource = path.join(__dirname, 'ios', 'ReceiptReader.m');
      const objcDest = path.join(platformProjectRoot, projectName, 'ReceiptReader.m');
      fs.copyFileSync(objcSource, objcDest);
      
      return config;
    },
  ]);
};