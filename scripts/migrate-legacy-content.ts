/**
 * One-time migration: restores the Vol.1/2/3 past events and their gallery
 * photos, which used to be hardcoded in the client, into the real database
 * tables (events, gallery_photos) now that those pages are DB-driven.
 *
 * Run once, on Replit (needs real DATABASE_URL + object storage credentials):
 *   npx tsx scripts/migrate-legacy-content.ts
 */
import { readFileSync } from "fs";
import path from "path";
import { ObjectStorageService } from "../server/objectStorage";
import { storage } from "../server/storage";

const ASSETS_DIR = path.resolve(import.meta.dirname, "..", "attached_assets");
const objectStorageService = new ObjectStorageService();

function mimeFor(filename: string): string {
  if (filename.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

async function uploadAsset(filename: string): Promise<string> {
  const filePath = path.join(ASSETS_DIR, filename);
  const buffer = readFileSync(filePath);
  const ext = filename.split(".").pop() || "jpg";
  const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL(ext);
  const res = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": mimeFor(filename) },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Upload failed for ${filename}: ${res.status}`);
  console.log(`  uploaded ${filename} -> ${objectPath}`);
  return objectPath;
}

const pastEventsData = [
  {
    volume: "VOL. 3",
    name: "AFTR VOL. 3",
    subtitle: "Full Capacity.",
    date: "18 Apr 2026",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description:
      "The biggest night yet. Every corner packed, every moment electric. Vol. 3 set a new standard for what AFTR means to Mauritius.",
    coverImage: "Promo_poster_1_1777967218262.png",
    artists: [] as string[],
  },
  {
    volume: "VOL. 2",
    name: "AFTR VOL. 2",
    subtitle: "The Bar Raised.",
    date: "30 Jan 2026",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description:
      "A packed dancefloor, harder-hitting energy, and a night that proved AFTR is only getting started.",
    coverImage: "IMG_6112_1774435245159.jpg",
    artists: ["DJ AFROKEYZ", "DJ LUVLESH", "DJ SWAY", "DJ ALVIN", "DJ SMARTFINGER", "DJ AVI.S"],
  },
  {
    volume: "VOL. 1",
    name: "AFTR: THE RAVE",
    subtitle: "Where It Began.",
    date: "27 Sep 2025",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description:
      "The night that started it all. 5 DJs, non-stop music from 10PM to 4AM — the most electric rave Mauritius had seen.",
    coverImage: "AFTR-1_1757155940525.jpg",
    artists: ["DJ ALVIN", "DJ LUVLESH", "STEVOTHEDJ", "DJ SWAY", "DJ AFROKEYZ"],
  },
];

const galleryPhotosData = [
  { file: "Serge_74_1777968315600.jpg", alt: "AFTR Vol. 3 — The Stage", volume: "VOL. 3" },
  { file: "Serge_75_1777968402515.jpg", alt: "AFTR Vol. 3 — The Crowd", volume: "VOL. 3" },
  { file: "Serge_83_1777968402525.jpg", alt: "AFTR Vol. 3 — The Green", volume: "VOL. 3" },
  { file: "Serge_103_1777968402526.jpg", alt: "AFTR Vol. 3 — The Vibe", volume: "VOL. 3" },
  { file: "vol2_4T7A9200.jpg", alt: "AFTR Vol. 2 — The Crowd", volume: "VOL. 2" },
  { file: "vol2_4T7A9259.jpg", alt: "AFTR Vol. 2 — On Stage", volume: "VOL. 2" },
  { file: "vol2_4T7A9366.jpg", alt: "AFTR Vol. 2 — The Night", volume: "VOL. 2" },
  { file: "vol2_4T7A9396.jpg", alt: "AFTR Vol. 2 — The Energy", volume: "VOL. 2" },
  { file: "vol2_4T7A9397.jpg", alt: "AFTR Vol. 2 — The Dancefloor", volume: "VOL. 2" },
  { file: "vol2_4T7A9398.jpg", alt: "AFTR Vol. 2 — The Vibes", volume: "VOL. 2" },
  { file: "vol2_4T7A9422.jpg", alt: "AFTR Vol. 2 — The Moment", volume: "VOL. 2" },
  { file: "IMG_6112_1774435245159.jpg", alt: "AFTR Vol. 2 — Flyer", volume: "VOL. 2" },
  { file: "vol1_Screenshot_2026-03-25_at_19.43.10.png", alt: "AFTR Vol. 1 — The Night", volume: "VOL. 1" },
  { file: "vol1_Screenshot_2026-03-25_at_19.43.41.png", alt: "AFTR Vol. 1 — The Energy", volume: "VOL. 1" },
  { file: "vol1_Screenshot_2026-03-25_at_20.01.14.png", alt: "AFTR Vol. 1 — The Crowd", volume: "VOL. 1" },
  { file: "DJ ALVIN_1757156832389.jpg", alt: "DJ ALVIN — Vol. 1", volume: "VOL. 1" },
  { file: "DJ LUVLESH_1757156832389.jpg", alt: "DJ LUVLESH — Vol. 1", volume: "VOL. 1" },
  { file: "STEVOTHEDJ_1757156832391.jpg", alt: "STEVOTHEDJ — Vol. 1", volume: "VOL. 1" },
  { file: "DJ SWAY_1757156832390.jpg", alt: "DJ SWAY — Vol. 1", volume: "VOL. 1" },
  { file: "DJ AFROKEYZ_1757156832386.jpg", alt: "DJ AFROKEYZ — Vol. 1", volume: "VOL. 1" },
];

async function main() {
  console.log("Checking for existing past events...");
  const existing = await storage.getPastEvents();
  const existingVolumes = new Set(existing.map((e) => e.volume).filter(Boolean));

  const eventIdByVolume: Record<string, string> = {};

  for (const ev of pastEventsData) {
    if (existingVolumes.has(ev.volume)) {
      console.log(`Skipping ${ev.volume} — an event with this volume already exists.`);
      const match = existing.find((e) => e.volume === ev.volume);
      if (match) eventIdByVolume[ev.volume] = match.id;
      continue;
    }
    console.log(`Creating past event: ${ev.name}`);
    const imageUrl = await uploadAsset(ev.coverImage);
    const created = await storage.createEvent({
      name: ev.name,
      date: ev.date,
      time: ev.time,
      venue: ev.venue,
      description: ev.description,
      subtitle: ev.subtitle,
      artists: ev.artists.length > 0 ? JSON.stringify(ev.artists) : null,
      volume: ev.volume,
      imageUrl,
      videoUrl: null,
      isPast: true,
      slug: null,
    } as any);
    eventIdByVolume[ev.volume] = created.id;
    console.log(`  created event ${created.id} (slug: ${created.slug})`);
  }

  console.log("\nChecking for existing gallery photos...");
  const existingPhotos = await storage.getAllGalleryPhotos();
  const existingAlts = new Set(existingPhotos.map((p) => p.alt));

  let order = existingPhotos.length;
  for (const photo of galleryPhotosData) {
    if (existingAlts.has(photo.alt)) {
      console.log(`Skipping "${photo.alt}" — already in gallery_photos.`);
      continue;
    }
    console.log(`Uploading gallery photo: ${photo.alt}`);
    const url = await uploadAsset(photo.file);
    await storage.createGalleryPhoto({
      url,
      alt: photo.alt,
      volume: photo.volume,
      eventId: eventIdByVolume[photo.volume] ?? null,
      order: order++,
    });
  }

  console.log("\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
