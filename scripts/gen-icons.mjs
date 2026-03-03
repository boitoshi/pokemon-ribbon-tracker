import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

/* ---- PNG エンコーダ（最小実装） ---- */
function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(pixels, width, height) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    rows.push(0);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rows.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }
  const raw = Buffer.from(rows);
  const compressed = deflateSync(raw, { level: 6 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

/* ---- アイコン描画 ---- */
function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2, r = size / 2;

  // ポケモンブルー背景
  const [br, bg, bb] = [0x3b, 0x4c, 0xca];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      // 円形クリップ
      if (dx*dx + dy*dy > r*r) { pixels[i+3] = 0; continue; }

      pixels[i]   = br;
      pixels[i+1] = bg;
      pixels[i+2] = bb;
      pixels[i+3] = 255;

      // リボン風モチーフ: 中央に白い★マーク
      const nx = dx / r, ny = dy / r;
      // ★の5頂点
      let inStar = false;
      const pts = 5, outerR = 0.45, innerR = 0.2;
      for (let p = 0; p < pts && !inStar; p++) {
        const a1 = -Math.PI/2 + p * 2*Math.PI/pts;
        const a2 = a1 + Math.PI/pts;
        const ox1 = Math.cos(a1)*outerR, oy1 = Math.sin(a1)*outerR;
        const ix  = Math.cos(a2)*innerR, iy  = Math.sin(a2)*innerR;
        const ox2 = Math.cos(a1 + 2*Math.PI/pts)*outerR, oy2 = Math.sin(a1 + 2*Math.PI/pts)*outerR;
        // 三角形 (ox1,oy1)→(ix,iy)→(ox2,oy2) の内外判定
        function sign(px,py,ax,ay,bx,by) { return (px-bx)*(ay-by)-(ax-bx)*(py-by); }
        const d1 = sign(nx,ny,ox1,oy1,ix,iy);
        const d2 = sign(nx,ny,ix,iy,ox2,oy2);
        const d3 = sign(nx,ny,ox2,oy2,ox1,oy1);
        const hasNeg = d1<0||d2<0||d3<0, hasPos = d1>0||d2>0||d3>0;
        if (!(hasNeg && hasPos)) inStar = true;
      }
      if (inStar) {
        pixels[i]   = 255;
        pixels[i+1] = 203; // ポケモンイエロー寄り
        pixels[i+2] = 5;
        pixels[i+3] = 255;
      }
    }
  }
  return pixels;
}

/* ---- メイン ---- */
mkdirSync('static/icons', { recursive: true });

for (const size of [192, 512]) {
  const pixels = drawIcon(size);
  const png = encodePNG(pixels, size, size);
  writeFileSync(`static/icons/icon-${size}.png`, png);
  console.log(`✅ static/icons/icon-${size}.png (${png.length} bytes)`);
}
