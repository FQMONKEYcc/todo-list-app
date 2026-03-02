// package-release.js — Package the built app into a compact archive
// Usage: node scripts/package-release.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist', 'win-unpacked');
const RELEASE_DIR = path.join(ROOT, 'release');
const VERSION = require(path.join(ROOT, 'package.json')).version;

// Output filenames
const ZIP_NAME = `TodoList-v${VERSION}-win-x64-portable.zip`;
const SEVENZ_NAME = `TodoList-v${VERSION}-win-x64-portable.7z`;

// 7-Zip path
const SEVENZ_BIN = 'C:/Program Files/7-Zip/7z.exe';

function formatSize(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function main() {
  // Verify build exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('ERROR: dist/win-unpacked not found. Run "npm run build:dir" first.');
    process.exit(1);
  }

  // Create release directory
  if (!fs.existsSync(RELEASE_DIR)) {
    fs.mkdirSync(RELEASE_DIR, { recursive: true });
  }

  // Clean old files
  const zipPath = path.join(RELEASE_DIR, ZIP_NAME);
  const sevenzPath = path.join(RELEASE_DIR, SEVENZ_NAME);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  if (fs.existsSync(sevenzPath)) fs.unlinkSync(sevenzPath);

  console.log('=== Todo List Release Packaging ===\n');

  // Calculate unpacked size
  let unpackedSize = 0;
  function calcDirSize(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        calcDirSize(fullPath);
      } else {
        unpackedSize += fs.statSync(fullPath).size;
      }
    }
  }
  calcDirSize(DIST_DIR);
  console.log(`Unpacked size: ${formatSize(unpackedSize)}`);

  // Check if 7z is available
  const has7z = fs.existsSync(SEVENZ_BIN);

  if (has7z) {
    // Use 7z with LZMA2 for best compression
    console.log('\nCreating 7z archive (LZMA2, ultra compression)...');
    try {
      execSync(
        `"${SEVENZ_BIN}" a -t7z -m0=lzma2 -mx=9 -mfb=273 -md=64m -ms=on "${sevenzPath}" "${DIST_DIR}\\*"`,
        { stdio: 'pipe' }
      );
      const sz = fs.statSync(sevenzPath).size;
      const ratio = ((1 - sz / unpackedSize) * 100).toFixed(1);
      console.log(`  -> ${SEVENZ_NAME}: ${formatSize(sz)} (compression: ${ratio}%)`);
    } catch (e) {
      console.error('7z compression failed:', e.message);
    }
  }

  // Also create standard zip as fallback
  console.log('\nCreating zip archive...');
  try {
    if (has7z) {
      // Use 7z for zip too — better compression than PowerShell
      execSync(
        `"${SEVENZ_BIN}" a -tzip -mx=9 "${zipPath}" "${DIST_DIR}\\*"`,
        { stdio: 'pipe' }
      );
    } else {
      // Fallback to PowerShell
      execSync(
        `powershell -Command "Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath '${zipPath}' -Force"`,
        { stdio: 'pipe' }
      );
    }
    const sz = fs.statSync(zipPath).size;
    const ratio = ((1 - sz / unpackedSize) * 100).toFixed(1);
    console.log(`  -> ${ZIP_NAME}: ${formatSize(sz)} (compression: ${ratio}%)`);
  } catch (e) {
    console.error('zip compression failed:', e.message);
  }

  // Summary
  console.log('\n=== Release files ===');
  const releaseFiles = fs.readdirSync(RELEASE_DIR);
  for (const f of releaseFiles) {
    const sz = fs.statSync(path.join(RELEASE_DIR, f)).size;
    console.log(`  ${f.padEnd(50)} ${formatSize(sz)}`);
  }
  console.log('\nDone!');
}

main();
