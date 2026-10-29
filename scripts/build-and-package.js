#!/usr/bin/env node
// scripts/build-and-package.js
// Run: node scripts/build-and-package.js
const { execSync } = require('child_process');

console.log('🦉 Hootly Build & Package Script');
console.log('==================================');

try {
  console.log('\n[1/2] Building Hootly...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build succeeded.\n');

  console.log('[2/2] Packaging installer with electron-builder...');
  execSync('npm run dist:win', { stdio: 'inherit' });
  console.log('✅ Packaging succeeded. Check the release/ folder for your installer.\n');
  console.log('🎉 Done! You can now install Hootly from release/Hootly Setup*.exe');
} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  console.error('Make sure you have run `npm install` first and that electron-builder is installed.');
  process.exit(1);
}
