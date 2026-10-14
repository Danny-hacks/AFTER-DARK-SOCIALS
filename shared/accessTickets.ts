import { ACCESS_AREA_LABELS, type AccessArea, type AccessTicketType } from "./schema";

/** A ticket type plus its live booking numbers for its edition. */
export type AccessTicketTypeWithAvailability = AccessTicketType & {
  confirmed: number;
  pending: number;
  used: number;
  available: number;
};

export function accessAreaLabel(area: string): string {
  return ACCESS_AREA_LABELS[area as AccessArea] ?? area;
}

/** "VIP Lounge — Table for 4" — what's stored on the reservation and shown everywhere. */
export function accessTicketTypeFullLabel(type: Pick<AccessTicketType, "area" | "label">): string {
  return `${accessAreaLabel(type.area)} — ${type.label}`;
}

/** Total price for a booking of `guests` people on this ticket type. */
export function accessTicketTypeTotal(type: Pick<AccessTicketType, "price" | "pricingMode">, guests: number): number {
  return type.pricingMode === "per_person" ? type.price * guests : type.price;
}

/** Short pass-ID prefix encoding area and size, e.g. V4, T5, B12. */
export function accessPassPrefix(type: Pick<AccessTicketType, "area" | "maxGuests">): string {
  const letter = type.area === "vip_lounge" ? "V" : type.area === "terrace" ? "T" : "B";
  return `${letter}${type.maxGuests}`;
}

/** How many tables are taken: the admin override if set, else confirmed bookings. */
export function withAvailability(
  type: AccessTicketType,
  counts: { confirmed: number; pending: number } | undefined,
): AccessTicketTypeWithAvailability {
  const confirmed = counts?.confirmed ?? 0;
  const pending = counts?.pending ?? 0;
  const used = type.manualUsed ?? confirmed;
  return { ...type, confirmed, pending, used, available: Math.max(0, type.capacity - used) };
}
