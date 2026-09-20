/**
 * One-off diagnostic: prints every accessEvents row's raw `date` string,
 * whether JS can parse it, and whether that makes it count as
 * upcoming/past/neither — to debug why /api/access/current returns null.
 *
 * Run once, on Replit, against the DB you want to inspect:
 *   DATABASE_URL="..." npx tsx scripts/debug-access-events.ts
 */
import { storage } from "../server/storage";

async function main() {
  const events = await storage.getAllAccessEvents();
  if (events.length === 0) {
    console.log("No accessEvents rows found at all.");
    return;
  }
  const now = Date.now();
  for (const e of events) {
    const parsed = new Date(e.date);
    const t = parsed.getTime();
    const valid = !isNaN(t);
    console.log(`\nid: ${e.id}`);
    console.log(`name: ${e.name}`);
    console.log(`raw date field: "${e.date}"`);
    console.log(`JS Date.parse result: ${valid ? parsed.toISOString() : "INVALID — unparseable"}`);
    console.log(`status: ${!valid ? "NEITHER upcoming nor past (unparseable — this is the bug)" : t > now ? "upcoming" : "past"}`);
    console.log(`posterUrl: ${e.posterUrl || "(empty)"}`);
    console.log(`description: ${e.description || "(empty)"}`);
    console.log(`lineupJson: ${e.lineupJson || "(empty)"}`);
    console.log(`earlyBirdDeadline: ${e.earlyBirdDeadline ?? "(empty)"}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
