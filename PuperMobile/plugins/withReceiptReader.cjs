const { withXcodeProject, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withReceiptReader = (config) => {
  // First copy the files to the iOS project directory
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const { projectRoot, platformProjectRoot } = config.modRequest;
      
      // Source files
      const nativeModulesDir = path.join(projectRoot, 'ios-native-modules');
      const swiftFile = 'ReceiptReader.swift';
      const objcFile = 'ReceiptReader.m';
      
      // Destination (root of iOS project, where Info.plist usually lives or main target)
      // Usually we want them visible to the target.
      
      // Check if sources exist
      if (fs.existsSync(path.join(nativeModulesDir, swiftFile))) {
        const dest = path.join(platformProjectRoot, swiftFile);
        fs.copyFileSync(path.join(nativeModulesDir, swiftFile), dest);
      }
      
      if (fs.existsSync(path.join(nativeModulesDir, objcFile))) {
        const dest = path.join(platformProjectRoot, objcFile);
        fs.copyFileSync(path.join(nativeModulesDir, objcFile), dest);
      }
      
      return config;
    },
  ]);

  // Then add them to the Xcode project structure
  return withXcodeProject(config, async (config) => {
    const { platformProjectRoot } = config.modRequest;
    const xcodeProject = config.modResults;
    
    const swiftFile = 'ReceiptReader.swift';
    const objcFile = 'ReceiptReader.m';
    
    // Only add files if they exist and target is available
    try {
      const target = xcodeProject.getFirstTarget();
      if (!target || !target.uuid) {
        console.warn('[ReceiptReader] No target found, skipping file addition');
        return config;
      }
      
      const swiftPath = path.join(platformProjectRoot, swiftFile);
      const objcPath = path.join(platformProjectRoot, objcFile);
      
      if (fs.existsSync(swiftPath)) {
        xcodeProject.addSourceFile(swiftFile, { target: target.uuid });
      }
      if (fs.existsSync(objcPath)) {
        xcodeProject.addSourceFile(objcFile, { target: target.uuid });
      }
    } catch (e) {
      // Silently fail - files are copied but may not be linked
      // This is non-critical for the build
      console.warn('[ReceiptReader] Could not add files to Xcode project:', e.message);
    }
    
    return config;
  });
};

module.exports = withReceiptReader;
