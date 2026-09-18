import type { Event, Ticket } from "@shared/schema";

// Emoji are written as \u{...} escapes (pure ASCII in this source file) rather
// than literal multi-byte characters — the literal form was getting mangled
// into replacement characters somewhere in the deploy pipeline.
const PARTY = "\u{1F389}";
const TICKET_EMOJI = "\u{1F3AB}";
const MONEY = "\u{1F4B0}";
const CALENDAR = "\u{1F4C5}";
const PIN = "\u{1F4CD}";
const NOTE = "\u{1F3B5}";
const FIRE = "\u{1F525}";

/** Delivery message sent to a customer once their ticket is ready — always built from the ticket's own event, never hardcoded. */
export function buildTicketWaMessage(ticket: Ticket, event?: Event | null): string {
  return encodeURIComponent(
    `${PARTY} Your ${event?.name ?? "AFTR"} ticket is ready! ${PARTY}\n\n` +
      `${TICKET_EMOJI} Reference: ${ticket.referenceCode}\n` +
      `${MONEY} Price: ${ticket.price}\n` +
      `${CALENDAR} Date: ${event?.date ?? ""}\n` +
      `${PIN} Venue: ${event?.venue ?? ""}\n\n` +
      `See you on the dance floor! ${NOTE}${FIRE}`,
  );
}
