// Ticket reference prefix from the event's Volume tag, e.g. "VOL.4" -> "VOL4".
// Falls back to "AFTR" when the event has no volume set.
export function ticketRefPrefix(volume: string | null | undefined): string {
  const cleaned = (volume ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned || "AFTR";
}

// A fresh reference like "VOL4-K3J9QX" that no existing ticket uses.
// `exists` checks the database; collisions are rare but retried anyway.
export async function generateTicketRef(
  prefix: string,
  exists: (ref: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, "0");
    const ref = `${prefix}-${randomPart}`;
    if (!(await exists(ref))) return ref;
  }
  throw new Error("Could not generate a unique ticket reference");
}
