/**
 * One-time seed: restores the 6 ACCESS "Past Editions" photos that used to
 * be hardcoded in access-passport.tsx into the real gallery_photos table,
 * now that the ACCESS gallery section is admin-managed/DB-driven. These
 * already live at permanent public R2 URLs, so this just creates the rows
 * pointing at them — no file upload needed.
 *
 * Run once, on Replit (needs real DATABASE_URL):
 *   npx tsx scripts/seed-access-gallery.ts
 */
import { storage } from "../server/storage";

const R2 = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures";

const photos = [
  `${R2}/Serge_53.jpg`,
  `${R2}/Serge_82.jpg`,
  `${R2}/Serge_70.jpg`,
  `${R2}/Serge_47.jpg`,
  `${R2}/Serge_49.jpg`,
  `${R2}/Serge_56.jpg`,
];

async function main() {
  for (let i = 0; i < photos.length; i++) {
    const photo = await storage.createGalleryPhoto({
      url: photos[i],
      alt: "ACCESS experience",
      volume: "",
      order: i,
      type: "image",
      section: "access",
    });
    console.log(`  created ${photo.id} -> ${photo.url}`);
  }
  console.log(`Done — ${photos.length} ACCESS gallery photos seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
