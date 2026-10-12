/**
 * Builds every image of the staff app from the Penpot exports in design/app-icon/:
 *   icon-1024.png           full-bleed icon (logo + "GESTIONE")
 *   icon-maskable-1024.png  same, inside Android's safe zone
 *   lockup-1024.png         logo + "GESTIONE" on transparent, for launch screens
 *
 *   npm run assets:app
 *
 * Output goes to public/gestore-prometeo-2026/ (icons/ and splash/).
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ADMIN_PATH, APP_THEME, IOS_SPLASH, splashFile } from "../src/lib/pwa.ts";

const SRC = "design/app-icon";
const OUT = path.join("public", ADMIN_PATH);

const png = (img: sharp.Sharp) => img.png({ compressionLevel: 9, palette: false });

async function icons() {
  await mkdir(path.join(OUT, "icons"), { recursive: true });
  const icon = path.join(SRC, "icon-1024.png");
  const maskable = path.join(SRC, "icon-maskable-1024.png");
  const jobs: [string, string, number][] = [
    [icon, "icon-192.png", 192],
    [icon, "icon-512.png", 512],
    [icon, "apple-touch-icon.png", 180],
    [maskable, "maskable-192.png", 192],
    [maskable, "maskable-512.png", 512],
  ];
  for (const [from, name, size] of jobs) {
    await png(sharp(from).resize(size, size, { kernel: "lanczos3" })).toFile(path.join(OUT, "icons", name));
  }

  // Android draws the status-bar badge as a white silhouette: logo only, no text.
  const svg = (await readFile("public/logo-emblem.svg", "utf8")).replace(/fill="#[0-9a-f]{6}"/i, 'fill="#ffffff"');
  const emblem = await sharp(Buffer.from(svg)).resize(80, 80, { fit: "contain", background: "#0000" }).toBuffer();
  await png(
    sharp({ create: { width: 96, height: 96, channels: 4, background: "#0000" } }).composite([{ input: emblem, gravity: "center" }]),
  ).toFile(path.join(OUT, "icons", "badge-96.png"));
}

async function splashes() {
  await mkdir(path.join(OUT, "splash"), { recursive: true });
  const lockup = path.join(SRC, "lockup-1024.png");
  for (const s of IOS_SPLASH) {
    const W = s.w * s.r;
    const H = s.h * s.r;
    // the lockup fills about half the screen width, centered optically a bit above the middle
    const size = Math.round(W * 0.5);
    const logo = await sharp(lockup).resize(size, size).toBuffer();
    await png(
      sharp({ create: { width: W, height: H, channels: 3, background: APP_THEME } }).composite([
        { input: logo, left: Math.round((W - size) / 2), top: Math.round(H * 0.46 - size / 2) },
      ]),
    ).toFile(path.join("public", splashFile(s)));
  }
}

await icons();
await splashes();
console.log(`App assets written to ${OUT}`);
