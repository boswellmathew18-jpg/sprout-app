import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function crc32(buf) {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (t[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length);
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([lb, tb, data, cb]);
}

function encodePNG(w, h, pixels) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8]=8; ihdr[9]=6; // RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (w*4+1)] = 0;
    for (let x = 0; x < w; x++) {
      const si = (y*w+x)*4, di = y*(w*4+1)+1+x*4;
      raw[di]=pixels[si]; raw[di+1]=pixels[si+1]; raw[di+2]=pixels[si+2]; raw[di+3]=pixels[si+3];
    }
  }
  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT', zlib.deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]);
}

function setpx(px, s, x, y, r, g, b, a=255) {
  x=Math.round(x); y=Math.round(y);
  if (x<0||x>=s||y<0||y>=s) return;
  const i=(y*s+x)*4; px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=a;
}

// Fill a circle with antialiased edge
function fillCircle(px, s, cx, cy, radius, r, g, b) {
  const x0=Math.floor(cx-radius-1), x1=Math.ceil(cx+radius+1);
  const y0=Math.floor(cy-radius-1), y1=Math.ceil(cy+radius+1);
  for (let y=y0; y<=y1; y++) {
    for (let x=x0; x<=x1; x++) {
      if (x<0||x>=s||y<0||y>=s) continue;
      const d=Math.sqrt((x-cx)**2+(y-cy)**2);
      if (d<=radius+0.5) {
        const a = d>radius-0.5 ? Math.round(255*(radius+0.5-d)) : 255;
        const i=(y*s+x)*4;
        // blend over existing
        const fa=a/255, fb=1-fa;
        px[i]  =Math.round(r*fa+px[i]  *fb);
        px[i+1]=Math.round(g*fa+px[i+1]*fb);
        px[i+2]=Math.round(b*fa+px[i+2]*fb);
        px[i+3]=Math.min(255, px[i+3]+a);
      }
    }
  }
}

function fillRect(px, s, x1, y1, x2, y2, r, g, b) {
  for (let y=Math.floor(y1); y<Math.ceil(y2); y++)
    for (let x=Math.floor(x1); x<Math.ceil(x2); x++)
      setpx(px, s, x, y, r, g, b, 255);
}

function generateIcon(size) {
  const px = new Uint8Array(size*size*4);

  // Background: #1a2e1a (26, 46, 26) — full bleed, OS applies rounded square mask
  for (let i=0; i<size*size*4; i+=4) {
    px[i]=26; px[i+1]=46; px[i+2]=26; px[i+3]=255;
  }

  const cx = size/2;
  // Tree color: #6cc274 (108, 194, 116)
  const [tr, tg, tb] = [108, 194, 116];
  // Trunk color: slightly darker #4a8a52 (74, 138, 82)
  const [vr, vg, vb] = [74, 138, 82];

  // Fluffy crown — 5 overlapping circles
  fillCircle(px, size, cx,             size*0.40, size*0.265, tr, tg, tb); // center
  fillCircle(px, size, cx - size*0.14, size*0.45, size*0.195, tr, tg, tb); // left
  fillCircle(px, size, cx + size*0.14, size*0.45, size*0.195, tr, tg, tb); // right
  fillCircle(px, size, cx - size*0.09, size*0.31, size*0.175, tr, tg, tb); // top-left
  fillCircle(px, size, cx + size*0.09, size*0.31, size*0.175, tr, tg, tb); // top-right

  // Trunk
  fillRect(px, size, cx - size*0.055, size*0.63, cx + size*0.055, size*0.77, vr, vg, vb);

  return encodePNG(size, size, px);
}

for (const size of [192, 512]) {
  const buf = generateIcon(size);
  const out = path.join(__dirname, 'public', `icon-${size}.png`);
  fs.writeFileSync(out, buf);
  console.log(`icon-${size}.png — ${buf.length} bytes`);
}
