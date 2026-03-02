// after-pack.js — Runs after electron-builder packs the app
// Removes unnecessary files to reduce distribution size
const fs = require('fs');
const path = require('path');

// Locales to keep (only Chinese + English)
const KEEP_LOCALES = new Set(['zh-CN.pak', 'en-US.pak']);

// Files to delete from the root of the unpacked directory
const DELETE_FILES = [
  'LICENSES.chromium.html',   // ~8.8MB, not needed for distribution
  'LICENSE.electron.txt',     // ~4KB
];

exports.default = async function afterPack(context) {
  const appDir = context.appOutDir;
  let totalSaved = 0;

  // 1. Remove unused locales (keep only zh-CN and en-US)
  const localesDir = path.join(appDir, 'locales');
  if (fs.existsSync(localesDir)) {
    const files = fs.readdirSync(localesDir);
    for (const file of files) {
      if (!KEEP_LOCALES.has(file)) {
        const filePath = path.join(localesDir, file);
        const stat = fs.statSync(filePath);
        totalSaved += stat.size;
        fs.unlinkSync(filePath);
      }
    }
    console.log(`  [after-pack] Removed ${files.length - KEEP_LOCALES.size} unused locales`);
  }

  // 2. Remove unnecessary files from root
  for (const fileName of DELETE_FILES) {
    const filePath = path.join(appDir, fileName);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      totalSaved += stat.size;
      fs.unlinkSync(filePath);
      console.log(`  [after-pack] Removed ${fileName}`);
    }
  }

  const savedMB = (totalSaved / (1024 * 1024)).toFixed(1);
  console.log(`  [after-pack] Total space saved: ${savedMB} MB`);
};
