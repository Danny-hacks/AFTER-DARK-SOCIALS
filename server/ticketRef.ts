// Ticket reference prefix from the event's Volume tag, e.g. "VOL.4" -> "VOL4".
// Falls back to "AFTR" when the event has no volume set.
export function ticketRefPrefix(volume: string | null | undefined): string {
  const cleaned = (volume ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned || "AFTR";
}
