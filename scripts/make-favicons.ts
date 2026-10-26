/**
 * Builds the site's icons from src/app/icon.svg, in the formats Google Search and the
 * browsers read (Google wants a square icon, a multiple of 48 px, at a stable address;
 * an SVG alone is often skipped, and it always asks for /favicon.ico too):
 *   src/app/favicon.ico     16, 32 and 48 px            → /favicon.ico
 *   src/app/icon1.png       192 px (4 × 48)             → <link rel="icon">
 *   src/app/apple-icon.png  180 px                      → <link rel="apple-touch-icon">
 *   public/logo.png         512 px, the logo of the restaurant's structured data
 *
 *   npm run assets:favicon
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("src/app/icon.svg");
const png = (size: number) => sharp(svg, { density: 300 }).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();

/** An .ico holding PNG images (read by every browser since 2007 and by Google). */
function ico(images: { size: number; data: Buffer }[]) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, at);
    head.writeUInt8(size >= 256 ? 0 : size, at + 1);
    head.writeUInt8(0, at + 2);
    head.writeUInt8(0, at + 3);
    head.writeUInt16LE(1, at + 4);
    head.writeUInt16LE(32, at + 6);
    head.writeUInt32LE(data.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((x) => x.data)]);
}

const sizes = [16, 32, 48];
await writeFile("src/app/favicon.ico", ico(await Promise.all(sizes.map(async (size) => ({ size, data: await png(size) })))));
await writeFile("src/app/icon1.png", await png(192));
await writeFile("src/app/apple-icon.png", await png(180));
await writeFile("public/logo.png", await png(512));
console.log("Icone create: src/app/favicon.ico, src/app/icon1.png, src/app/apple-icon.png, public/logo.png");
