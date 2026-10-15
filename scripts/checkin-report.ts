/**
 * READ-ONLY report on AFTR ticket check-ins — changes nothing.
 *
 * Looks for what makes a ticket say "already checked in" at the door:
 *   1. Two tickets sharing a QR code (should never happen).
 *   2. Orders whose tickets weren't all sent — the buyer may have forwarded
 *      one ticket to several people.
 *   3. Multi-ticket orders where every ticket carries the buyer's name
 *      (no guest names), so a copy can't be told apart at the door.
 * Plus the full check-in timeline per event.
 *
 * Note: a rejected "already checked in" scan is not saved anywhere, so this
 * can only show the successful check-ins and the patterns around them.
 *
 * Run on Replit, against production:
 *   DATABASE_URL="..." npx tsx scripts/checkin-report.ts
 * Only one event (name contains the text, case-insensitive):
 *   DATABASE_URL="..." npx tsx scripts/checkin-report.ts --event "anniversary"
 */
import { storage } from "../server/storage";
import type { Ticket } from "@shared/schema";

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleString("en-GB", { timeZone: "Indian/Mauritius", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

async function main() {
  const eventArg = process.argv.indexOf("--event");
  const eventFilter = eventArg !== -1 ? (process.argv[eventArg + 1] ?? "").toLowerCase() : "";

  const [tickets, events, purchases] = await Promise.all([
    storage.getAllTickets(),
    storage.getAllEvents(),
    storage.getAllTicketPurchases(),
  ]);
  const purchaseById = new Map(purchases.map((p) => [p.id, p]));

  // ── 1. Duplicate QR codes (across everything) ──
  const byQr = new Map<string, Ticket[]>();
  for (const t of tickets) byQr.set(t.qrCode, [...(byQr.get(t.qrCode) ?? []), t]);
  const dupes = Array.from(byQr.values()).filter((g) => g.length > 1);
  console.log("\n=== 1. Tickets sharing a QR code ===");
  if (dupes.length === 0) console.log("None — every ticket has its own QR code.");
  for (const g of dupes) console.log(`  QR ${g[0].qrCode}: ${g.map((t) => `${t.referenceCode} (${t.customerName})`).join(", ")}`);

  const selectedEvents = events.filter((e) =>
    eventFilter ? e.name.toLowerCase().includes(eventFilter) : tickets.some((t) => t.eventId === e.id && t.isUsed),
  );
  if (selectedEvents.length === 0) console.log(eventFilter ? `\nNo event matches "${eventFilter}".` : "\nNo event has check-ins yet.");

  for (const ev of selectedEvents) {
    const evTickets = tickets.filter((t) => t.eventId === ev.id);
    const used = evTickets.filter((t) => t.isUsed).sort((a, b) => new Date(a.usedAt ?? 0).getTime() - new Date(b.usedAt ?? 0).getTime());
    const manual = evTickets.filter((t) => !t.purchaseId);

    console.log(`\n\n################ ${ev.name} — ${ev.date} ################`);
    console.log(`Tickets: ${evTickets.length} (${evTickets.length - manual.length} from orders, ${manual.length} manual) · checked in: ${used.length} · not checked in: ${evTickets.length - used.length}`);

    // ── Timeline ──
    console.log("\n=== Check-in timeline ===");
    for (const t of used) {
      const p = t.purchaseId ? purchaseById.get(t.purchaseId) : undefined;
      const source = p ? `order by ${p.customerName} (${p.quantity}x)` : "MANUAL";
      console.log(`  ${fmt(t.usedAt)}  ${t.customerName.padEnd(26)} ${t.ticketType.padEnd(16)} ${t.referenceCode.padEnd(14)} ${source}`);
    }

    // Group order tickets
    const byOrder = new Map<string, Ticket[]>();
    for (const t of evTickets) if (t.purchaseId) byOrder.set(t.purchaseId, [...(byOrder.get(t.purchaseId) ?? []), t]);
    const multi = Array.from(byOrder.entries()).filter(([, ts]) => ts.length > 1);

    // ── 2. Partly-sent orders ──
    console.log("\n=== 2. Multi-ticket orders not fully sent (buyer may have forwarded one ticket) ===");
    let flagged = 0;
    for (const [pid, ts] of multi) {
      const sent = ts.filter((t) => t.isDelivered).length;
      if (sent === ts.length) continue;
      flagged++;
      const p = purchaseById.get(pid);
      console.log(`  ${p?.customerName ?? "?"} — ${sent}/${ts.length} sent, ${ts.filter((t) => t.isUsed).length}/${ts.length} checked in`);
      for (const t of ts) console.log(`      ${t.referenceCode}  ${t.customerName.padEnd(24)} ${t.isDelivered ? "sent    " : "NOT SENT"}  ${t.isUsed ? `checked in ${fmt(t.usedAt)}` : "not checked in"}`);
    }
    if (flagged === 0) console.log("  None.");

    // ── 3. Orders with no guest names ──
    console.log("\n=== 3. Multi-ticket orders where every ticket has the buyer's name ===");
    flagged = 0;
    for (const [pid, ts] of multi) {
      if (new Set(ts.map((t) => t.customerName.trim().toLowerCase())).size > 1) continue;
      flagged++;
      const p = purchaseById.get(pid);
      console.log(`  ${p?.customerName ?? "?"} — ${ts.length} tickets, ${ts.filter((t) => t.isUsed).length} checked in: ${ts.map((t) => `${t.referenceCode}${t.isUsed ? " ✓" : ""}`).join(", ")}`);
    }
    if (flagged === 0) console.log("  None.");

    // ── Not checked in ──
    const unused = evTickets.filter((t) => !t.isUsed);
    if (unused.length > 0) {
      console.log("\n=== Not checked in ===");
      for (const t of unused) {
        const p = t.purchaseId ? purchaseById.get(t.purchaseId) : undefined;
        console.log(`  ${t.customerName.padEnd(26)} ${t.ticketType.padEnd(16)} ${t.referenceCode.padEnd(14)} ${p ? `order by ${p.customerName}` : "MANUAL"}${t.isDelivered ? "" : " · never marked sent"}`);
      }
    }
  }
  console.log("");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
