import { withDangerousMod } from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default withReceiptReader;
