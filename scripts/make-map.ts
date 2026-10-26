/**
 * Builds the static map of the "Dove siamo" section from OpenStreetMap tiles:
 *
 *   npm run assets:map
 *
 * Output: public/img/mappa-z<zoom>.webp, dark and centred on the restaurant (the
 * pin is drawn by the page, in the middle). The file is served by the site
 * itself, so visitors never load anything from Google or OSM: no third-party
 * cookies, no consent needed. Map data © OpenStreetMap contributors (ODbL),
 * the page shows the credit.
 */
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

// Via Michele Torraca 10, Matera (OSM node 10103685921)
const LAT = 40.6657221;
const LON = 16.6037029;
const ZOOM = 19;
const SIZE = 1280;
const TILE = 256;
// the zoom is in the name: a new file name is the only thing that busts the image optimizer cache
const OUT = `public/img/mappa-z${ZOOM}.webp`;

// position of the restaurant in world pixels at ZOOM
const world = TILE * 2 ** ZOOM;
const cx = ((LON + 180) / 360) * world;
const rad = (LAT * Math.PI) / 180;
const cy = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * world;

const left = cx - SIZE / 2;
const top = cy - SIZE / 2;
const tx0 = Math.floor(left / TILE);
const ty0 = Math.floor(top / TILE);
const tx1 = Math.floor((left + SIZE) / TILE);
const ty1 = Math.floor((top + SIZE) / TILE);

async function tile(x: number, y: number) {
  // one-off download, well within the OSM tile usage policy
  const res = await fetch(`https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`, {
    headers: { "User-Agent": "PrometeoBook static map builder (one-off)" },
  });
  if (!res.ok) throw new Error(`tile ${x}/${y}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const tiles: sharp.OverlayOptions[] = [];
for (let x = tx0; x <= tx1; x++) {
  for (let y = ty0; y <= ty1; y++) {
    tiles.push({ input: await tile(x, y), left: x * TILE - Math.floor(left), top: y * TILE - Math.floor(top) });
  }
}

const raw = await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: "#f2efe9" } })
  .composite(tiles)
  .png()
  .toBuffer();

await mkdir("public/img", { recursive: true });
// same look as the old Google embed: inverted, grey, a hint of the gold
await sharp(raw)
  .grayscale()
  .negate({ alpha: false })
  .linear(0.85, 6)
  .tint({ r: 200, g: 165, b: 90 })
  .webp({ quality: 78 })
  .toFile(OUT);

console.log(`${OUT}  (${tiles.length} tiles, z${ZOOM})`);
