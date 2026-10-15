/**
 * Builds the static map of the home page (public/img/mappa-1600.webp) from
 * OpenStreetMap tiles, once, on this computer:
 *
 *   npm run assets:map
 *
 * Why an image and not an embedded Google Map: an iframe sends every visitor's
 * IP address to Google (and can set cookies) before any consent. The image is
 * served by our own domain, so the home page contacts no third party.
 * OpenStreetMap data is ODbL: the page must show "© OpenStreetMap".
 * Re-run only if the restaurant moves (coordinates of Via Michele Torraca 10, Matera).
 */
import sharp from "sharp";

const LAT = 40.66572;
const LON = 16.6037;
const ZOOM = 17;
const W = 1600;
const H = 1200;
const OUT = "public/img/mappa-1600.webp";
// gold of the design system (--color-gold, --color-ink)
const GOLD = "#c8a55a";
const INK = "#0b0b0b";

const n = 2 ** ZOOM;
const px = ((LON + 180) / 360) * n * 256;
const rad = (LAT * Math.PI) / 180;
const py = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * 256;

const left = px - W / 2;
const top = py - H / 2;
const x0 = Math.floor(left / 256);
const y0 = Math.floor(top / 256);
const x1 = Math.floor((left + W) / 256);
const y1 = Math.floor((top + H) / 256);

const tiles: sharp.OverlayOptions[] = [];
for (let x = x0; x <= x1; x++) {
  for (let y = y0; y <= y1; y++) {
    // tile usage policy: identify the app, few requests, no bulk downloads
    const res = await fetch(`https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`, {
      headers: { "User-Agent": "PrometeoBook static map builder (one-off)" },
    });
    if (!res.ok) throw new Error(`tile ${x}/${y}: HTTP ${res.status}`);
    tiles.push({ input: Buffer.from(await res.arrayBuffer()), left: x * 256 - x0 * 256, top: y * 256 - y0 * 256 });
  }
}

const mosaic = await sharp({
  create: { width: (x1 - x0 + 1) * 256, height: (y1 - y0 + 1) * 256, channels: 3, background: "#ffffff" },
})
  .composite(tiles)
  .png()
  .toBuffer();

// dark map in the site's palette: grey, inverted, low contrast
const base = await sharp(mosaic)
  .extract({ left: Math.round(left - x0 * 256), top: Math.round(top - y0 * 256), width: W, height: H })
  .grayscale()
  .negate({ alpha: false })
  .linear(0.82, 6)
  .png()
  .toBuffer();

// pin: gold drop with the ink dot, tip on the restaurant
const pin = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="96" viewBox="0 0 24 32">
    <path d="M12 31C12 31 2 19.5 2 12a10 10 0 0 1 20 0c0 7.5-10 19-10 19z" fill="${GOLD}" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="12" cy="12" r="3.6" fill="${INK}"/>
  </svg>`,
);

await sharp(base)
  .composite([{ input: pin, left: W / 2 - 36, top: H / 2 - 96 }])
  .webp({ quality: 78 })
  .toFile(OUT);

console.log(`${OUT} ✓ (${W}×${H}, zoom ${ZOOM})`);
