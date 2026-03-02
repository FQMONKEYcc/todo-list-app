// Generate a simple .ico file for the Todo List app
// Run: node scripts/generate-icon.js

const fs = require('fs');
const path = require('path');

// Create a 256-color BMP-based ICO with multiple sizes
// We'll generate 16x16, 32x32, 48x48, and 256x256

function createBitmapData(size) {
  const pixels = [];
  const center = size / 2;
  const radius = size * 0.42;
  const innerRadius = size * 0.32;

  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const dx = x - center + 0.5;
      const dy = y - center + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside the circle - gradient background
        const t = dist / radius;
        // Primary blue color #7aa2f7 with gradient
        const r = Math.round(122 - t * 30);
        const g = Math.round(162 - t * 30);
        const b = Math.round(247 - t * 20);

        // Draw a checkmark in the center
        const nx = (x - center) / (size * 0.3);
        const ny = (y - center) / (size * 0.3);

        let isCheck = false;
        // Left stroke of check: from (-0.5, 0) to (0, 0.5)
        const checkLeftDist = Math.abs((ny - 0) - 1.0 * (nx - (-0.5))) / Math.sqrt(2);
        if (checkLeftDist < 0.18 && nx >= -0.6 && nx <= 0.1 && ny >= -0.15 && ny <= 0.65) {
          isCheck = true;
        }
        // Right stroke of check: from (0, 0.5) to (0.7, -0.5)
        const slope2 = (-0.5 - 0.5) / (0.7 - 0);
        const checkRightDist = Math.abs((ny - 0.5) - slope2 * (nx - 0)) / Math.sqrt(1 + slope2 * slope2);
        if (checkRightDist < 0.18 && nx >= -0.1 && nx <= 0.8 && ny >= -0.65 && ny <= 0.65) {
          isCheck = true;
        }

        if (isCheck) {
          // White checkmark
          pixels.push(255, 255, 255, 255);
        } else {
          pixels.push(b, g, r, 255);
        }
      } else if (dist <= radius + 1) {
        // Anti-aliased edge
        const alpha = Math.round(255 * (1 - (dist - radius)));
        pixels.push(Math.round(247 * alpha / 255), Math.round(162 * alpha / 255), Math.round(122 * alpha / 255), alpha);
      } else {
        // Transparent
        pixels.push(0, 0, 0, 0);
      }
    }
  }
  return Buffer.from(pixels);
}

function createPngChunk(type, data) {
  const buf = Buffer.alloc(4 + type.length + data.length + 4);
  buf.writeUInt32BE(data.length, 0);
  buf.write(type, 4);
  data.copy(buf, 4 + type.length);
  // CRC
  const crcData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(crcData);
  buf.writeInt32BE(crc, buf.length - 4);
  return buf;
}

// CRC32 lookup table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

function createPng(size) {
  const pixels = [];
  const center = size / 2;
  const radius = size * 0.42;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center + 0.5;
      const dy = y - center + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        const t = dist / radius;
        const r = Math.round(122 - t * 30);
        const g = Math.round(162 - t * 30);
        const b = Math.round(247 - t * 20);

        const nx = (x - center) / (size * 0.3);
        const ny = (y - center) / (size * 0.3);

        let isCheck = false;
        const checkLeftDist = Math.abs((ny - 0) - 1.0 * (nx - (-0.5))) / Math.sqrt(2);
        if (checkLeftDist < 0.18 && nx >= -0.6 && nx <= 0.1 && ny >= -0.15 && ny <= 0.65) {
          isCheck = true;
        }
        const slope2 = (-0.5 - 0.5) / (0.7 - 0);
        const checkRightDist = Math.abs((ny - 0.5) - slope2 * (nx - 0)) / Math.sqrt(1 + slope2 * slope2);
        if (checkRightDist < 0.18 && nx >= -0.1 && nx <= 0.8 && ny >= -0.65 && ny <= 0.65) {
          isCheck = true;
        }

        if (isCheck) {
          pixels.push(255, 255, 255, 255);
        } else {
          pixels.push(r, g, b, 255);
        }
      } else if (dist <= radius + 1.2) {
        const alpha = Math.max(0, Math.round(255 * (1 - (dist - radius) / 1.2)));
        pixels.push(122, 162, 247, alpha);
      } else {
        pixels.push(0, 0, 0, 0);
      }
    }
  }

  // Build raw RGBA rows with filter byte
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    rawRows.push(0); // filter: none
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      rawRows.push(pixels[idx], pixels[idx+1], pixels[idx+2], pixels[idx+3]);
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawRows));

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createPngChunk('IHDR', ihdrData);

  // IDAT
  const idat = createPngChunk('IDAT', compressed);

  // IEND
  const iend = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createIco(sizes) {
  // Use PNG format for all sizes (modern ICO)
  const pngs = sizes.map(s => createPng(s));

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(sizes.length, 4); // image count

  // Directory entries: 16 bytes each
  const dirSize = sizes.length * 16;
  const dataOffset = 6 + dirSize;

  let currentOffset = dataOffset;
  const entries = [];

  for (let i = 0; i < sizes.length; i++) {
    const entry = Buffer.alloc(16);
    entry[0] = sizes[i] >= 256 ? 0 : sizes[i]; // width (0 = 256)
    entry[1] = sizes[i] >= 256 ? 0 : sizes[i]; // height
    entry[2] = 0; // color palette
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngs[i].length, 8); // data size
    entry.writeUInt32LE(currentOffset, 12); // data offset
    entries.push(entry);
    currentOffset += pngs[i].length;
  }

  return Buffer.concat([header, ...entries, ...pngs]);
}

// Generate
const ico = createIco([16, 32, 48, 256]);
const outDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'icon.ico');
fs.writeFileSync(outPath, ico);
console.log(`Icon generated: ${outPath} (${ico.length} bytes)`);

// Also generate tray icon PNG (16x16)
const trayPng = createPng(16);
const trayPath = path.join(outDir, 'tray-icon.png');
fs.writeFileSync(trayPath, trayPng);
console.log(`Tray icon generated: ${trayPath} (${trayPng.length} bytes)`);
