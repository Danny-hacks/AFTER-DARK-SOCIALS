import type { Event, Ticket } from "@shared/schema";

// Plain text only, deliberately — \u{...} escapes for emoji were tried here
// before and still came through as a replacement character in the actual
// delivered WhatsApp message, so whatever mangles them isn't source encoding.
// Not worth re-investigating for decorative characters; just don't use them.

/** Delivery message sent to a customer once their ticket is ready — always built from the ticket's own event, never hardcoded. */
export function buildTicketWaMessage(ticket: Ticket, event?: Event | null): string {
  return encodeURIComponent(
    `Your ${event?.name ?? "AFTR"} ticket is ready!\n\n` +
      `Reference: ${ticket.referenceCode}\n` +
      `Price: ${ticket.price}\n` +
      `Date: ${event?.date ?? ""}\n` +
      `Venue: ${event?.venue ?? ""}\n\n` +
      `See you on the dance floor!`,
  );
}
