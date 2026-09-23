/**
 * One-time backfill: every existing accessReservations row has eventId =
 * null (the column is new). Capacity is now scoped per-edition by eventId,
 * so without this, existing bookings against the CURRENT live ACCESS
 * event would silently stop counting toward "confirmed" the moment this
 * ships — making the table look more available than it really is.
 *
 * This sets eventId on every null-eventId reservation to whichever ACCESS
 * event is currently "upcoming" (same logic the public site already uses
 * to decide which edition is live). If there's no upcoming event
 * configured, it does nothing and tells you so — run it again once you've
 * created/confirmed the current edition in Admin -> ACCESS Events.
 *
 * Run once, on Replit, against the DB you want to fix:
 *   DATABASE_URL="..." npx tsx scripts/backfill-access-reservation-events.ts
 */
import { storage } from "../server/storage";

async function main() {
  const currentEvent = await storage.getUpcomingAccessEvent();
  if (!currentEvent) {
    console.log("No upcoming ACCESS event found — nothing to backfill against. Run again once one exists.");
    return;
  }

  const all = await storage.getAllAccessReservations();
  const toFix = all.filter((r) => !r.eventId);
  if (toFix.length === 0) {
    console.log("No reservations with a null eventId — nothing to do.");
    return;
  }

  console.log(`Backfilling ${toFix.length} reservation(s) to event "${currentEvent.name}" (${currentEvent.id})...`);
  for (const r of toFix) {
    await storage.updateAccessReservationEventId(r.id, currentEvent.id);
    console.log(`  ${r.id} (${r.tableType}, ${r.status}) -> ${currentEvent.id}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
