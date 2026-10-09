export type TicketClass = "all" | "vip" | "standard";

// Any tier with "VIP" in its name (e.g. "Early Bird VIP", "Golden VIP") is
// VIP; everything else counts as Standard/Regular.
export function isVipTicketType(ticketType: string): boolean {
  return /vip/i.test(ticketType);
}

export function matchesTicketClass(ticketType: string, cls: TicketClass): boolean {
  if (cls === "all") return true;
  return cls === "vip" ? isVipTicketType(ticketType) : !isVipTicketType(ticketType);
}

export function TicketClassFilter({
  value,
  onChange,
  ticketTypes,
}: {
  value: TicketClass;
  onChange: (value: TicketClass) => void;
  /** Ticket types of the items being filtered, for the per-option counts. */
  ticketTypes: string[];
}) {
  const vip = ticketTypes.filter(isVipTicketType).length;
  const options: { key: TicketClass; label: string; count: number }[] = [
    { key: "all", label: "All", count: ticketTypes.length },
    { key: "vip", label: "VIP", count: vip },
    { key: "standard", label: "Standard", count: ticketTypes.length - vip },
  ];
  return (
    <div className="flex border border-white/15 w-fit" role="group" aria-label="Filter by ticket class">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors border-r border-white/15 last:border-r-0 ${
            value === o.key ? "bg-[#c9962a] text-black" : "text-white/40 hover:text-white"
          }`}
        >
          {o.label} <span className={value === o.key ? "text-black/60" : "text-white/25"}>{o.count}</span>
        </button>
      ))}
    </div>
  );
}
