/**
 * One-off fix: ticket verification used to hardcode "VOL3-" as the reference
 * prefix for every event. This renames any ticket whose prefix doesn't match
 * its own event's Volume tag (e.g. an AFTR: ANNIVERSARY ticket tagged VOL.4
 * getting "VOL3-40YTLU" -> "VOL4-40YTLU"), keeping the random part.
 *
 * Safe for tickets not yet sent. The QR code doesn't use the reference code,
 * so scanning keeps working either way — but a customer who was already sent
 * the old code would see a different one in admin afterwards. The script
 * lists already-sent tickets separately and leaves them alone unless you
 * pass --include-sent.
 *
 * Run once, on Replit, against production:
 *   DATABASE_URL="..." npx tsx scripts/fix-ticket-ref-prefixes.ts
 */
import { storage } from "../server/storage";
import { ticketRefPrefix } from "../server/ticketRef";

async function main() {
  const includeSent = process.argv.includes("--include-sent");
  const [allTickets, allEvents] = await Promise.all([storage.getAllTickets(), storage.getAllEvents()]);
  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  let renamed = 0;
  for (const t of allTickets) {
    const event = t.eventId ? eventById.get(t.eventId) : undefined;
    if (!event) continue;
    const expected = ticketRefPrefix(event.volume);
    const dash = t.referenceCode.indexOf("-");
    if (dash === -1) continue;
    const currentPrefix = t.referenceCode.slice(0, dash);
    // Only fix the known hardcoded "VOL3" prefix — leave anything else
    // (e.g. codes typed by hand for manual tickets) untouched.
    if (currentPrefix !== "VOL3" || currentPrefix === expected) continue;

    const newCode = `${expected}-${t.referenceCode.slice(dash + 1)}`;
    if (t.isDelivered && !includeSent) {
      console.log(`  SKIPPED (already sent): ${t.referenceCode} -> would be ${newCode} (${t.customerName}, ${event.name})`);
      continue;
    }
    await storage.updateTicketReferenceCode(t.id, newCode);
    console.log(`  ${t.referenceCode} -> ${newCode} (${t.customerName}, ${event.name})`);
    renamed++;
  }
  console.log(`Done — ${renamed} ticket(s) renamed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
