/**
 * One-time cleanup: several bundled marketing images in attached_assets/ are
 * raw camera-resolution files (up to 38MB) imported directly as Vite static
 * assets and shipped as-is to every visitor. Resizes each to a sane web
 * dimension and re-encodes as JPEG, overwriting the original — same
 * compression philosophy already used for user uploads in ObjectUploader.tsx,
 * just applied once to the static assets actually imported by the client.
 *
 * Run locally (no DATABASE_URL needed — pure file processing):
 *   npx tsx scripts/optimize-static-images.ts
 */
import sharp from "sharp";
import { statSync, renameSync, unlinkSync } from "fs";
import path from "path";

const ASSETS_DIR = path.resolve(import.meta.dirname, "..", "attached_assets");
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 82;
const MIN_SIZE_TO_TOUCH = 300 * 1024; // skip files already reasonably small

// Only touch files actually imported by the client (grepped from
// client/src for `@assets/...` references) — never blanket-process every
// file in attached_assets, some of which are unrelated uploads/scratch.
const TARGET_FILES = [
  "AFTR-1_1757155940525.jpg",
  "ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png",
  "IMG_6112_1774435245159.jpg",
  "Promo_poster_1_1777967218262.png",
  "Serge_103_1777968402526.jpg",
  "Serge_74_1777968315600.jpg",
  "Serge_75_1777968402515.jpg",
  "Serge_83_1777968402525.jpg",
  path.join("stock_images", "dark_nightclub_rave__d23cebfd.jpg"),
  "vol2_4T7A9200.jpg",
];

async function optimize(relPath: string) {
  const filePath = path.join(ASSETS_DIR, relPath);
  const before = statSync(filePath).size;

  if (before < MIN_SIZE_TO_TOUCH) {
    console.log(`Skipping ${relPath} — already ${(before / 1024).toFixed(0)}KB`);
    return;
  }

  // Keep the original format and filename — the logo PNG relies on alpha
  // transparency (used over dark backgrounds in navbar/footer), which a
  // JPEG conversion would destroy, and renaming would break every
  // `@assets/...` import referencing these files by exact filename.
  const isPng = filePath.toLowerCase().endsWith(".png");
  const pipeline = sharp(filePath)
    .rotate() // respect EXIF orientation before resizing
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });

  const buffer = isPng
    ? await pipeline.png({ quality: 80, compressionLevel: 9 }).toBuffer()
    : await pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer();

  // Writing straight back to the same path libvips just read from fails on
  // Windows ("unable to open for write" / EINVAL) — write to a temp path
  // and swap it in instead.
  const tmpPath = `${filePath}.tmp`;
  await sharp(buffer).toFile(tmpPath);
  unlinkSync(filePath);
  renameSync(tmpPath, filePath);

  const after = statSync(filePath).size;
  console.log(`${relPath}: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024).toFixed(0)}KB`);
}

async function main() {
  for (const rel of TARGET_FILES) {
    try {
      await optimize(rel);
    } catch (err) {
      console.error(`Failed on ${rel}:`, err);
    }
  }
}

main().then(() => console.log("Done."));
