/**
 * Generates assets/icon.png (256x256) from the Hootly SVG icon
 * using only Node.js built-ins + the Canvas API via Electron's bundled Chromium.
 * Actually: we write a self-contained SVG-to-PNG converter using
 * the `sharp` or pure SVG approach. Since we cannot run Electron here,
 * we'll write the PNG manually using a base64-encoded pre-rendered icon.
 *
 * This script creates a 256x256 PNG file with the Hootly owl logo.
 * Run with: node scripts/gen-icon.js
 */

const fs = require('fs');
const path = require('path');

// Minimal PNG encoder (pure JS, no deps)
function createPNG(width, height, pixels) {
  // pixels: Uint8Array of RGBA values, row by row
  const { deflate } = require('zlib');

  function crc32(buf) {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type);
    const buf = Buffer.concat([typeBytes, data]);
    const crc = crc32(buf);
    const out = Buffer.alloc(4 + 4 + data.length + 4);
    out.writeUInt32BE(data.length, 0);
    typeBytes.copy(out, 4);
    data.copy(out, 8);
    out.writeUInt32BE(crc, 8 + data.length);
    return out;
  }

  // Build raw scanlines with filter byte
  const rawData = Buffer.alloc((1 + width * 4) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter type: None
    pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  return new Promise((resolve, reject) => {
    require('zlib').deflate(rawData, (err, compressed) => {
      if (err) return reject(err);
      const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      const ihdr = Buffer.alloc(13);
      ihdr.writeUInt32BE(width, 0);
      ihdr.writeUInt32BE(height, 4);
      ihdr[8] = 8; // bit depth
      ihdr[9] = 2; // color type: RGB (we'll use 6 = RGBA)
      ihdr[9] = 6;
      ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
      const png = Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0))
      ]);
      resolve(png);
    });
  });
}

// Draw the Hootly owl in a 256x256 pixel buffer
async function drawOwl() {
  const W = 256, H = 256;
  const pixels = Buffer.alloc(W * H * 4, 0); // transparent

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (Math.round(y) * W + Math.round(x)) * 4;
    pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = a;
  }

  function fillCircle(cx, cy, r, R, G, B, A = 255) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          setPixel(cx + dx, cy + dy, R, G, B, A);
        }
      }
    }
  }

  function fillEllipse(cx, cy, rx, ry, R, G, B, A = 255) {
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
          setPixel(cx + dx, cy + dy, R, G, B, A);
        }
      }
    }
  }

  function fillRect(x, y, w, h, R, G, B, A = 255) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setPixel(x + dx, y + dy, R, G, B, A);
      }
    }
  }

  // Scale factor: SVG is 100x100, PNG is 256x256
  const scale = 2.56;
  const ox = 0, oy = 0; // offset

  function s(v) { return Math.round(v * scale); }

  // Background: dark gradient circle
  fillCircle(128, 128, 126, 22, 26, 64, 255);

  // Flame (streak) - orange below body
  for (let dy = -s(20); dy <= 0; dy++) {
    const fw = s(14) * Math.cos((dy / s(20)) * Math.PI * 0.5);
    for (let dx = -fw; dx <= fw; dx++) {
      const t = 1 - (dy + s(20)) / s(20);
      const R = Math.round(234 + t * 21);
      const Gv = Math.round(88 + t * 100);
      const B = 12;
      setPixel(128 + dx, s(82) + dy, R, Gv, B);
    }
  }

  // Branch
  fillRect(s(22), s(80), s(56), s(6), 120, 53, 15);

  // Talons
  fillEllipse(s(42), s(81), s(4), s(2), 245, 158, 11);
  fillEllipse(s(58), s(81), s(4), s(2), 245, 158, 11);

  // Body
  fillEllipse(s(50), s(56), s(26), s(25), 55, 65, 170);

  // Belly
  fillEllipse(s(50), s(62), s(17), s(16), 22, 26, 64, 180);

  // Wings
  fillEllipse(s(28), s(58), s(6), s(14), 40, 50, 140);
  fillEllipse(s(72), s(58), s(6), s(14), 40, 50, 140);

  // Ear tufts
  // Left ear: triangle roughly at 30,32 -> 36,42 -> 24,40
  for (let dy = 0; dy <= s(10); dy++) {
    const t = dy / s(10);
    const x1 = s(30) + t * (s(36) - s(30));
    const x2 = s(30) + t * (s(24) - s(30));
    for (let dx = Math.min(x1, x2); dx <= Math.max(x1, x2); dx++) {
      setPixel(dx, s(32) + dy, 55, 65, 170);
    }
  }
  // Right ear
  for (let dy = 0; dy <= s(10); dy++) {
    const t = dy / s(10);
    const x1 = s(70) + t * (s(64) - s(70));
    const x2 = s(70) + t * (s(76) - s(70));
    for (let dx = Math.min(x1, x2); dx <= Math.max(x1, x2); dx++) {
      setPixel(dx, s(32) + dy, 55, 65, 170);
    }
  }

  // Head circle
  fillCircle(s(50), s(42), s(21), 55, 65, 170);

  // Eye sockets
  fillCircle(s(41), s(41), s(9), 22, 26, 64);
  fillCircle(s(59), s(41), s(9), 22, 26, 64);

  // Pupils
  fillCircle(s(42), s(41), s(5), 240, 245, 255);
  fillCircle(s(58), s(41), s(5), 240, 245, 255);

  // Pupil blacks
  fillCircle(s(42), s(42), s(3), 10, 10, 30);
  fillCircle(s(58), s(42), s(3), 10, 10, 30);

  // Eye highlights
  fillCircle(s(44), s(39), s(2), 255, 255, 255);
  fillCircle(s(60), s(39), s(2), 255, 255, 255);

  // Glasses ring (accent)
  for (let a = 0; a < 360; a += 1) {
    const rad = a * Math.PI / 180;
    const gx1 = s(41) + Math.round(Math.cos(rad) * s(10));
    const gy1 = s(41) + Math.round(Math.sin(rad) * s(10));
    setPixel(gx1, gy1, 139, 92, 246);
    const gx2 = s(59) + Math.round(Math.cos(rad) * s(10));
    const gy2 = s(41) + Math.round(Math.sin(rad) * s(10));
    setPixel(gx2, gy2, 139, 92, 246);
  }

  // Beak (orange triangle: 50,45 46,51 54,51)
  for (let dy = 0; dy <= s(6); dy++) {
    const t = dy / s(6);
    const bx1 = s(50) + t * (s(46) - s(50));
    const bx2 = s(50) + t * (s(54) - s(50));
    for (let dx = Math.round(Math.min(bx1, bx2)); dx <= Math.round(Math.max(bx1, bx2)); dx++) {
      setPixel(dx, s(45) + dy, 245, 158, 11);
    }
  }

  // Mortarboard cap
  // Base rect
  fillRect(s(42), s(24), s(16), s(6), 30, 27, 75);
  // Board polygon (50,14 74,21 50,28 26,21)
  for (let dy = 0; dy <= s(14); dy++) {
    const t = dy / s(14);
    const lx = s(50) + t * (s(26) - s(50));
    const rx = s(50) + t * (s(74) - s(50));
    for (let dx = Math.round(lx); dx <= Math.round(rx); dx++) {
      setPixel(dx, s(14) + dy, 30, 27, 75);
    }
  }
  // Tassel line
  for (let dy = 0; dy <= s(11); dy++) {
    const tx = s(50) + (dy / s(11)) * s(14);
    setPixel(Math.round(tx), s(21) + dy, 245, 158, 11);
  }
  fillCircle(s(64), s(33), s(2), 245, 158, 11);

  return pixels;
}

async function main() {
  const pixels = await drawOwl();
  const png = await createPNG(256, 256, pixels);
  const outPath = path.join(__dirname, '..', 'assets', 'icon.png');
  fs.writeFileSync(outPath, png);
  console.log('✅ Generated assets/icon.png (' + png.length + ' bytes)');
}

main().catch(console.error);
