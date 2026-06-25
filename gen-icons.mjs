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
    raw[y * (w*4+1)] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      const si = (y*w+x)*4, di = y*(w*4+1)+1+x*4;
      raw[di]=pixels[si]; raw[di+1]=pixels[si+1]; raw[di+2]=pixels[si+2]; raw[di+3]=pixels[si+3];
    }
  }
  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT', zlib.deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]);
}

function setpx(px, s, x, y, r, g, b, a) {
  x=Math.round(x); y=Math.round(y);
  if (x<0||x>=s||y<0||y>=s) return;
  const i=(y*s+x)*4; px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=a;
}

function fillRect(px, s, x1, y1, x2, y2, r, g, b) {
  for (let y=Math.floor(y1); y<Math.ceil(y2); y++)
    for (let x=Math.floor(x1); x<Math.ceil(x2); x++)
      setpx(px, s, x, y, r, g, b, 255);
}

function fillTri(px, s, x1,y1, x2,y2, x3,y3, r,g,b) {
  const minY=Math.floor(Math.min(y1,y2,y3)), maxY=Math.ceil(Math.max(y1,y2,y3));
  const edges=[[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]];
  for (let y=minY; y<=maxY; y++) {
    const xs=[];
    for (const [ax,ay,bx,by] of edges)
      if ((ay<=y&&by>y)||(by<=y&&ay>y)) xs.push(ax+(y-ay)/(by-ay)*(bx-ax));
    if (xs.length>=2) { xs.sort((a,b)=>a-b);
      for (let x=Math.floor(xs[0]); x<=Math.ceil(xs[xs.length-1]); x++) setpx(px,s,x,y,r,g,b,255); }
  }
}

function generateIcon(size) {
  const px = new Uint8Array(size*size*4);
  const cx=size/2, r=size*0.46;

  // Green circle background, transparent outside
  for (let y=0; y<size; y++) {
    for (let x=0; x<size; x++) {
      const d=Math.sqrt((x-cx)**2+(y-cx)**2);
      const i=(y*size+x)*4;
      if (d<=r+0.5) {
        const a = d>r-0.5 ? Math.round(255*(r+0.5-d)) : 255;
        px[i]=45; px[i+1]=106; px[i+2]=79; px[i+3]=a; // #2d6a4f
      }
      // else alpha stays 0 (transparent)
    }
  }

  const s=size;
  // Three-tier pine tree in white
  fillTri(px,s, cx,s*.17, cx-s*.17,s*.41, cx+s*.17,s*.41, 255,255,255);
  fillTri(px,s, cx,s*.27, cx-s*.24,s*.53, cx+s*.24,s*.53, 255,255,255);
  fillTri(px,s, cx,s*.37, cx-s*.30,s*.65, cx+s*.30,s*.65, 255,255,255);
  // Trunk
  fillRect(px,s, cx-s*.035,s*.63, cx+s*.035,s*.76, 255,255,255);

  return encodePNG(size,size,px);
}

for (const size of [192, 512]) {
  const buf = generateIcon(size);
  const out = path.join(__dirname, 'public', `icon-${size}.png`);
  fs.writeFileSync(out, buf);
  console.log(`icon-${size}.png — ${buf.length} bytes`);
}
