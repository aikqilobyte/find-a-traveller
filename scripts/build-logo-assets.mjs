// Splits the full logo lockup (brand/logo-source.png) into a square icon
// mark, a trimmed lockup, and a favicon — by finding horizontal bands of
// content separated by blank rows. Re-run with `node scripts/build-logo-assets.mjs`
// after replacing the source artwork.
import sharp from "sharp";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(ROOT, "brand/logo-source.png");
const OUT_DIR = resolve(ROOT, "public");

const img = sharp(SRC).ensureAlpha();
const meta = await img.metadata();
const { width, height } = meta;
console.log(`source: ${width}x${height}`);

const { data } = await img.raw().toBuffer({ resolveWithObject: true });

const isContent = (x, y) => {
  const i = (y * width + x) * 4;
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 32) return false;
  return r < 235 || g < 235 || b < 235;
};

// Row occupancy
const rowHas = [];
for (let y = 0; y < height; y++) {
  let found = false;
  for (let x = 0; x < width; x++) {
    if (isContent(x, y)) { found = true; break; }
  }
  rowHas.push(found);
}

// Group contiguous content rows into bands, ignoring tiny specks
const bands = [];
let start = null;
for (let y = 0; y < height; y++) {
  if (rowHas[y] && start === null) start = y;
  if ((!rowHas[y] || y === height - 1) && start !== null) {
    const end = rowHas[y] ? y : y - 1;
    if (end - start > 8) bands.push([start, end]);
    start = null;
  }
}
console.log("content bands (y ranges):", bands);

const colBoundsFor = (y0, y1) => {
  let minX = width, maxX = -1;
  for (let y = y0; y <= y1; y++) {
    for (let x = 0; x < width; x++) {
      if (isContent(x, y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  return [minX, maxX];
};

// First band = the icon mark
const [iy0, iy1] = bands[0];
const [ix0, ix1] = colBoundsFor(iy0, iy1);
const markW = ix1 - ix0 + 1;
const markH = iy1 - iy0 + 1;
const side = Math.max(markW, markH);
const pad = Math.round(side * 0.06);
const box = side + pad * 2;
const cx = Math.round((ix0 + ix1) / 2);
const cy = Math.round((iy0 + iy1) / 2);

console.log(`mark: x ${ix0}-${ix1} (${markW}), y ${iy0}-${iy1} (${markH}) -> square ${box}`);

// Extract a square around the mark, extending with white where it runs past edges
await sharp(SRC)
  .extract({
    left: Math.max(0, cx - Math.round(box / 2)),
    top: Math.max(0, cy - Math.round(box / 2)),
    width: Math.min(box, width - Math.max(0, cx - Math.round(box / 2))),
    height: Math.min(box, height - Math.max(0, cy - Math.round(box / 2))),
  })
  .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile(`${OUT_DIR}/logo-mark.png`);
console.log("wrote public/logo-mark.png (512x512)");

// Full lockup: everything, trimmed to content
const allY0 = bands[0][0];
const allY1 = bands[bands.length - 1][1];
const [ax0, ax1] = colBoundsFor(allY0, allY1);
const fpad = Math.round((ax1 - ax0) * 0.03);
await sharp(SRC)
  .extract({
    left: Math.max(0, ax0 - fpad),
    top: Math.max(0, allY0 - fpad),
    width: Math.min(ax1 - ax0 + 1 + fpad * 2, width - Math.max(0, ax0 - fpad)),
    height: Math.min(allY1 - allY0 + 1 + fpad * 2, height - Math.max(0, allY0 - fpad)),
  })
  .resize({ width: 900 })
  .png()
  .toFile(`${OUT_DIR}/logo-full.png`);
console.log("wrote public/logo-full.png");

// Favicon source
await sharp(`${OUT_DIR}/logo-mark.png`).resize(180, 180).png().toFile(resolve(ROOT, "src/app/icon.png"));
console.log("wrote src/app/icon.png (favicon)");
