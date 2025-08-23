/ fix-css-comments.js
// Run this script in your frontend directory: node fix-css-comments.js

const fs = require('fs');
const path = require('path');

function findCSSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
      findCSSFiles(filePath, fileList);
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixCSSComments(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace standalone // comments at the beginning of lines
  const standaloneLine = content.replace(/^(\s*)\/\/(.*)$/gm, (match, indent, comment) => {
    modified = true;
    return `${indent}/* ${comment.trim()} */`;
  });
  
  // Replace inline // comments (but not URLs like http://)
  const fixed = standaloneLine.replace(/([^:])\/\/(.*)$/gm, (match, before, comment) => {
    modified = true;
    return `${before}/* ${comment.trim()} */`;
  });
  
  // Check for unclosed comments
  const openComments = (fixed.match(/\/\*/g) || []).length;
  const closeComments = (fixed.match(/\*\//g) || []).length;
  
  if (openComments !== closeComments) {
    console.log(`⚠️  Warning: ${filePath} has unclosed comments (${openComments} open, ${closeComments} close)`);
  }
  
  // Check for other potential issues
  if (fixed.includes('//') && !fixed.includes('://')  && !fixed.includes('data:image')) {
    console.log(`⚠️  Warning: ${filePath} still contains // that might need attention`);
  }
  
  if (modified) {
    // Create backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    
    // Write fixed content
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed: ${filePath} (backup created: ${backupPath})`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔍 Searching for CSS files...\n');

const srcDir = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) {
  console.error('❌ src directory not found. Make sure you run this script from the frontend directory.');
  process.exit(1);
}

const cssFiles = findCSSFiles(srcDir);
console.log(`Found ${cssFiles.length} CSS files\n`);

let fixedCount = 0;
cssFiles.forEach(file => {
  if (fixCSSComments(file)) {
    fixedCount++;
  }
});

if (fixedCount > 0) {
  console.log(`\n✨ Fixed ${fixedCount} files with CSS comment issues`);
  console.log('📝 Backup files created with .backup extension');
  console.log('\nNow try running: npm run build');
} else {
  console.log('\n✅ No JavaScript-style comments found in CSS files');
  console.log('\nIf the build still fails, check for:');
  console.log('  - Unclosed CSS comments');
  console.log('  - Invalid CSS syntax');
  console.log('  - Special characters in content properties');
}