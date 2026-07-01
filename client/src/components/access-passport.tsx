import { useState, useRef, useEffect } from "react";
import { SiWhatsapp } from "react-icons/si";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PassportCard } from "@/components/passport-card";
import type { PassFields } from "@/components/passport-card";

// ─── Constants ────────────────────────────────────────────────────────────────
const EARLY_BIRD_DEADLINE = new Date("2026-07-02T19:59:00.000Z");
const EARLY_BIRD_PRICE = 350;
const REGULAR_PRICE = 500;
const ADMIN_PHONE = "23058205220";
const R2 = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures";
const POSTER_URL = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures/IMG_0246.PNG";

function isEarlyBirdActive(): boolean {
  return new Date() < EARLY_BIRD_DEADLINE;
}

// ─── Table config (mirrors server TABLE_INVENTORY) ────────────────────────────
const TABLE_CONFIG: Record<
  string,
  {
    label: string;
    price: number;
    pricePerPerson: number;
    totalLabel: string;
    capacity: number;
    maxGuests: number;
    minGuests: number;
    description: string;
  }
> = {
  table_4: {
    label: "Table for 4",
    price: 2000,
    pricePerPerson: 500,
    totalLabel: "MUR 2,000 total",
    capacity: 5,
    maxGuests: 4,
    minGuests: 1,
    description: "Reserved table. Entry tickets only.",
  },
  table_5: {
    label: "Table for 5",
    price: 2500,
    pricePerPerson: 500,
    totalLabel: "MUR 2,500 total",
    capacity: 5,
    maxGuests: 5,
    minGuests: 1,
    description: "Premium positioning. Entry tickets only.",
  },
  section_8_12: {
    label: "Section (8\u201312 guests)",
    price: 4000,
    pricePerPerson: 500,
    totalLabel: "MUR 4,000\u20136,000 \u00b7 final total confirmed on approval",
    capacity: 3,
    maxGuests: 12,
    minGuests: 8,
    description: "Exclusive floor section. Entry tickets only.",
  },
};

type TableKey = keyof typeof TABLE_CONFIG;

interface InventoryItem {
  label: string;
  price: number;
  pricePerPerson: number;
  totalLabel: string;
  capacity: number;
  maxGuests: number;
  minGuests: number;
  description: string;
  used: number;
}

interface GuestData {
  name: string;
  photo: string;
  phone: string;
  passId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number, l: number) {
  return String(n).padStart(l, "0");
}
function rndId() {
  return "ACC-" + pad(Math.floor(Math.random() * 99999), 5);
}

const accessPhotos: { src: string | null; position: string; alt: string }[] = [
  { src: `${R2}/Serge_53.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_82.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_70.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_47.jpg`, position: "object-bottom",  alt: "ACCESS experience" },
  { src: `${R2}/Serge_49.jpg`, position: "object-bottom",  alt: "ACCESS experience" },
  { src: `${R2}/Serge_56.jpg`, position: "object-center", alt: "ACCESS experience" },
];

// ─── Main component ───────────────────────────────────────────────────────────
export function AccessPassport() {
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableKey | null>(null);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [activeGuest, setActiveGuest] = useState<number>(0);
  const [sending, setSending] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // General entry state
  const earlyBird = isEarlyBirdActive();
  const [geName, setGeName] = useState("");
  const [gePhone, setGePhone] = useState("");

  // Fetch inventory on mount
  useEffect(() => {
    fetch("/api/access/capacity")
      .then((r) => r.json())
      .then((data) => {
        const merged: Record<string, InventoryItem> = {};
        for (const key of Object.keys(TABLE_CONFIG)) {
          const local = TABLE_CONFIG[key];
          const server = data[key] || {};
          merged[key] = { ...local, used: server.used ?? 0 };
        }
        setInventory(merged);
      })
      .catch(() => {
        const fallback: Record<string, InventoryItem> = {};
        for (const key of Object.keys(TABLE_CONFIG)) {
          fallback[key] = { ...TABLE_CONFIG[key], used: 0 };
        }
        setInventory(fallback);
      })
      .finally(() => setLoadingInventory(false));
  }, []);

  const allSoldOut =
    !loadingInventory &&
    Object.keys(TABLE_CONFIG).every((key) => {
      const item = inventory[key];
      return item && item.used >= item.capacity;
    });

  const selectedConfig = selectedTable ? inventory[selectedTable] : null;

  const FIXED_COUNTS: Record<TableKey, number> = {
    table_4: 4,
    table_5: 5,
    section_8_12: 8,
  };

  function selectTable(key: TableKey) {
    setSelectedTable(key);
    setActiveGuest(0);
    const count = FIXED_COUNTS[key];
    const newGuests: GuestData[] = Array.from(
      { length: count },
      (_, i) => guests[i] ?? { name: "", photo: "", phone: "", passId: rndId() },
    );
    setGuests(newGuests);
  }

  function updateGuest(index: number, patch: Partial<GuestData>) {
    setGuests((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function handlePhoto(index: number, file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => updateGuest(index, { photo: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  function handleGeneralEntryWA() {
    if (!geName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    const tierLabel = earlyBird ? `Early Bird MUR ${EARLY_BIRD_PRICE}` : `General Entry MUR ${REGULAR_PRICE}`;
    const msg =
      `Hi, I'd like to reserve a General Entry ticket for ACCESS on 3 July 2026 at Club Sixty Nine.\n\n` +
      `Ticket: ${tierLabel}\n` +
      `Name: ${geName.trim()}\n` +
      `Phone: ${gePhone.trim() || "—"}\n\n` +
      `Looking forward to hearing from you.`;
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function sendAllPasses() {
    if (!selectedTable || !selectedConfig) return;

    const unfilled = guests.findIndex((g) => !g.name.trim());
    if (unfilled !== -1) {
      setActiveGuest(unfilled);
      toast({ title: `Please fill in the name for Guest ${unfilled + 1}`, variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      await fetch("/api/access/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableType: selectedTable,
          guests: guests.map(({ name, phone }) => ({ name, phone })),
        }),
      });
    } catch {}

    const guestLines = guests
      .map((g, i) => {
        const parts = [`${i + 1}. ${g.name.toUpperCase()}`];
        if (g.phone) parts.push(g.phone);
        return parts.join(" \u2014 ");
      })
      .join("\n");

    const localConfig = TABLE_CONFIG[selectedTable];
    const adminMsg =
      `NEW ACCESS RESERVATION\n\n` +
      `Table: ${selectedConfig.label}\n` +
      `Price: MUR 500 per person \u00b7 ${localConfig.totalLabel}\n` +
      `Date: 3 July 2026\n` +
      `Venue: Club Sixty Nine\n` +
      `Note: Entry tickets only \u2014 no drinks included\n\n` +
      `Guests (${guests.length} ${guests.length === 1 ? "person" : "people"}):\n` +
      guestLines +
      `\n\nAwaiting payment confirmation.`;

    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(adminMsg)}`, "_blank");

    setSending(false);
    toast({
      title: "Reservation request received",
      description: "We will send your passes once payment is confirmed. Please complete your payment via WhatsApp.",
    });
  }

  const labelCls = "block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2";
  const inputCls = "w-full bg-transparent border-0 border-b border-white/15 text-white placeholder:text-white/20 text-sm px-0 py-3 focus:outline-none focus:border-[#c9962a]/50 transition-colors";

  return (
    <div className="min-h-screen bg-black text-white pt-28">
      {/* ── Section 1: Header ── */}
      <div className="px-5 sm:px-6 lg:px-12 pb-12 border-b border-white/10">
        <div className="flex items-center gap-4 mb-16">
          <span className="w-8 h-px bg-[#c9962a]" />
          <span className="text-[#c9962a] text-[10px] uppercase tracking-[0.35em]">Exclusive Experience</span>
        </div>
        <h1
          className="text-white leading-none mb-6"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(56px, 10vw, 140px)" }}
        >
          RSVP FOR
          <br />
          <span style={{ background: "linear-gradient(135deg,#c9962a,#f5d76e,#b8860b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            ACCESS.
          </span>
        </h1>
        <p className="text-white/40 text-sm leading-relaxed max-w-xl">
          Select your table, enter your group's details, and your passes generate instantly. Send them via WhatsApp and present at the door.
        </p>
      </div>

      {/* ── Section 2: Banner Image ── */}
      <div className="my-12 px-5 sm:px-6 lg:px-12">
        <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden">
          <img src={`${R2}/Serge_59.jpg`} alt="ACCESS experience" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <p className="absolute bottom-8 left-5 sm:left-6 lg:left-12 text-white/30 text-[9px] uppercase tracking-[0.3em]">ACCESS · 2026</p>
        </div>
      </div>

      {/* ── Section 3: Event Poster + Info ── */}
      <div className="border-b border-white/10 py-12 px-5 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Poster */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <img
              src={POSTER_URL}
              alt="ACCESS event poster"
              className="shadow-2xl w-full max-w-[380px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          {/* Event info */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-[#c72d28]" />
              <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Upcoming Event</span>
            </div>

            <h2
              className="font-black leading-none mb-2"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(52px, 8vw, 80px)", background: "linear-gradient(135deg,#c9962a,#f5d76e,#b8860b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              ACCESS
            </h2>
            <p className="text-[#c9962a]/60 text-[11px] uppercase tracking-[0.3em] mb-6">An AFTR Private Social Night</p>

            <div className="border-t border-white/10 pt-6 mb-6 space-y-3">
              {[
                ["DATE", "Friday 3 July 2026"],
                ["VENUE", "Club Sixty Nine"],
                ["TIME", "Doors Open 8PM"],
                ["CONTACT", "+230 5820 5220"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-4">
                  <span className="text-[#c9962a] text-[9px] uppercase tracking-[0.25em] w-16 shrink-0">{label}</span>
                  <span className="text-white text-sm font-mono">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em] mb-4">DJ Lineup</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "DJ Sweety", origin: "Mayotte's Finest", genres: "Amapiano · Afrobeat · Dancehall" },
                  { name: "DJ Luvlesh", origin: "Mauritius' Favourite", genres: "Amapiano · Afrobeat" },
                ].map((dj) => (
                  <div key={dj.name} className="border border-white/8 p-3">
                    <p className="text-white leading-none mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px" }}>{dj.name}</p>
                    <p className="text-[#c9962a] text-[8px] uppercase tracking-[0.25em] mb-1">{dj.origin}</p>
                    <p className="text-white/30 text-[9px]">{dj.genres}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/25 text-[10px] mb-6">In collaboration with Kultur'M</p>

            <div className="border-t border-white/10 pt-5 flex items-center gap-3">
              <span className="text-[#c9962a] text-[10px] uppercase tracking-[0.3em]">Reserve Your Table Below</span>
              <ChevronDown className="w-4 h-4 text-[#c9962a] animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Reservation content ── */}
      <div className="px-5 sm:px-6 lg:px-12 pb-20 pt-12">
        {allSoldOut ? (
          <div className="border border-[#c72d28]/30 bg-[#c72d28]/8 px-8 py-12 text-center max-w-lg mx-auto">
            <div className="font-black text-[#c72d28] mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "32px" }}>
              FULLY BOOKED
            </div>
            <p className="text-white/40 text-sm">
              ACCESS is at full capacity. Follow <span className="text-white/60">@afterdarksocials.mu</span> for updates on future events.
            </p>
          </div>
        ) : (
          <>
            {/* ── General Entry Card ── */}
            <div className="mb-12 border border-white/10 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left: badge, title, price, notes */}
                <div>
                  {earlyBird ? (
                    <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.25em] font-bold">Early Bird</span>
                  ) : (
                    <span className="text-white/30 text-[9px] uppercase tracking-[0.25em]">General Entry</span>
                  )}
                  <p className="text-white leading-none mt-2 mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(28px,5vw,42px)" }}>
                    General Entry
                  </p>
                  <div className="flex items-baseline gap-3 mb-3">
                    <p className="font-mono font-medium" style={{ color: "#c9962a", fontSize: "28px" }}>
                      MUR {earlyBird ? EARLY_BIRD_PRICE : REGULAR_PRICE}
                    </p>
                    {earlyBird && (
                      <p className="text-white/30 text-[11px] line-through font-mono">MUR {REGULAR_PRICE}</p>
                    )}
                  </div>
                  {earlyBird && (
                    <div className="space-y-1">
                      <p className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Limited to 50 tickets</p>
                      <p className="text-white/25 text-[9px] uppercase tracking-[0.15em]">Price increases Friday 3 July</p>
                    </div>
                  )}
                </div>

                {/* Right: name, phone, button */}
                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input
                      type="text"
                      value={geName}
                      onChange={(e) => setGeName(e.target.value)}
                      placeholder="Full name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>WhatsApp Number (Optional)</label>
                    <input
                      type="tel"
                      value={gePhone}
                      onChange={(e) => setGePhone(e.target.value)}
                      placeholder="+230 5XXX XXXX"
                      className={inputCls}
                    />
                  </div>
                  <button
                    onClick={handleGeneralEntryWA}
                    className="flex items-center gap-2 bg-[#c72d28] hover:bg-[#a01f1f] text-white text-[9px] uppercase tracking-[0.2em] font-bold px-6 py-3.5 transition-colors self-start"
                  >
                    <SiWhatsapp className="w-3 h-3" />
                    Reserve via WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* ── Step 1: Table selection ── */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-px bg-[#c72d28]" />
                <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Table Reservations</span>
              </div>
              <p className="text-white leading-none mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px, 6vw, 72px)" }}>
                Reserve Your Table
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: "rgba(201,150,42,0.6)" }}>Friday 3 July 2026 · Club Sixty Nine</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.entries(TABLE_CONFIG).map(([key, config]) => {
                  const item = inventory[key];
                  const used = item?.used ?? 0;
                  const remaining = config.capacity - used;
                  const soldOut = remaining <= 0;
                  const isSelected = selectedTable === key;

                  return (
                    <button
                      key={key}
                      onClick={() => !soldOut && selectTable(key as TableKey)}
                      disabled={soldOut}
                      className={[
                        "text-left p-6 border transition-all duration-200",
                        soldOut
                          ? "opacity-40 pointer-events-none border-white/15"
                          : isSelected
                            ? "border-[#c9962a] bg-[#c9962a]/5"
                            : "border-white/15 hover:border-[#c9962a]/50",
                      ].join(" ")}
                    >
                      {/* Label */}
                      <span className="text-white leading-none block mb-2" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "22px" }}>
                        {config.label}
                      </span>

                      {/* Pricing */}
                      <p className="text-[#c9962a] text-[13px] font-mono font-medium mb-0.5">MUR 500 per person</p>
                      <p className="text-[12px] font-mono text-white/50 mb-3">{config.totalLabel}</p>

                      {/* Capacity */}
                      <p className="text-[#c9962a]/60 text-[9px] uppercase tracking-[0.25em] font-medium mb-2">Up to {config.maxGuests} guests</p>

                      {/* Remaining */}
                      {!soldOut && (
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] mb-3">
                          {remaining} {remaining === 1 ? "table" : "tables"} remaining
                        </p>
                      )}
                      {soldOut && (
                        <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.2em] mb-3 font-medium">Sold Out</p>
                      )}

                      {/* Description */}
                      <p className="text-white/40 text-[11px] leading-snug mb-3">{config.description}</p>

                      {/* Drinks note */}
                      <p className="text-[10px] text-white/25" style={{ fontStyle: "italic" }}>Drinks not included.</p>
                    </button>
                  );
                })}
              </div>

              {/* FIX 6 — next step prompt, only when no table selected */}
              {!selectedTable && (
                <p className="text-center italic mt-5" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                  Select a table above to fill in your group details and receive your passes.
                </p>
              )}
            </div>

            {/* ── Guest forms + passport preview ── */}
            {guests.length > 0 && selectedConfig && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                {/* Guest forms */}
                <div className="lg:col-span-5 space-y-0">
                  {guests.map((guest, i) => (
                    <div
                      key={guest.passId}
                      onClick={() => setActiveGuest(i)}
                      className={[
                        "border-t border-white/10 pt-8 pb-8 pl-4 cursor-pointer transition-all",
                        activeGuest === i ? "border-l-2 border-l-[#c9962a]" : "border-l-2 border-l-transparent",
                      ].join(" ")}
                    >
                      <p className="text-[#c9962a] text-[10px] uppercase tracking-[0.3em] mb-6">Guest {i + 1}</p>

                      <div className="mb-6">
                        <label className={labelCls}>Full Name *</label>
                        <input
                          type="text"
                          value={guest.name}
                          onFocus={() => setActiveGuest(i)}
                          onChange={(e) => updateGuest(i, { name: e.target.value })}
                          placeholder="Full name"
                          maxLength={24}
                          className={inputCls}
                        />
                      </div>

                      <div className="mb-6">
                        <label className={labelCls}>Photo (Optional)</label>
                        <div
                          onClick={(e) => { e.stopPropagation(); fileRefs.current[i]?.click(); }}
                          className="border border-dashed border-white/10 hover:border-[#c9962a]/25 transition-colors cursor-pointer p-4 text-center"
                        >
                          <input
                            ref={(el) => { fileRefs.current[i] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(i, f); }}
                          />
                          {guest.photo ? (
                            <div className="flex items-center gap-3">
                              <img src={guest.photo} alt="preview" className="w-9 h-11 object-cover object-top" />
                              <span className="text-white/35 text-[9px] uppercase tracking-[0.18em]">Photo ready · tap to change</span>
                            </div>
                          ) : (
                            <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">Upload photo</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>WhatsApp Number (Optional)</label>
                        <input
                          type="tel"
                          value={guest.phone}
                          onFocus={() => setActiveGuest(i)}
                          onChange={(e) => updateGuest(i, { phone: e.target.value })}
                          placeholder="+230 5XXX XXXX"
                          className={inputCls}
                        />
                        <p className="text-white/20 text-[9px] mt-1.5 uppercase tracking-[0.15em]">Their pass will be sent here</p>
                      </div>
                    </div>
                  ))}

                  {/* Summary + send */}
                  <div className="border-t border-white/10 pt-8 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white text-sm font-mono">{selectedConfig.label}</p>
                      <p className="text-[#c9962a] text-xs font-mono">MUR 500 per person</p>
                      <p className="text-white/30 text-[9px] font-mono mt-0.5">{TABLE_CONFIG[selectedTable!]?.totalLabel}</p>
                      <p className="text-white/30 text-[9px] uppercase tracking-[0.15em] mt-0.5">
                        {guests.length} {guests.length === 1 ? "pass" : "passes"}
                      </p>
                    </div>
                    <button
                      onClick={sendAllPasses}
                      disabled={sending}
                      className="flex items-center gap-2 bg-[#c9962a] hover:bg-[#b8860b] disabled:opacity-40 text-black text-[9px] uppercase tracking-[0.2em] font-bold px-6 py-4 transition-colors whitespace-nowrap"
                    >
                      <SiWhatsapp className="w-3 h-3" />
                      {sending ? "Sending..." : "Send All Passes"}
                    </button>
                  </div>
                </div>

                {/* Live passport preview */}
                <div className="lg:col-span-7 lg:sticky lg:top-8">
                  <p className="text-white/20 text-[9px] uppercase tracking-[0.25em] mb-5">
                    Guest {activeGuest + 1} Pass · Updates Live
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
                    <div style={{ flexShrink: 0, transformOrigin: "top center", transform: "scale(min(1, calc((100vw - 32px) / 323)))" }}>
                      <PassportCard
                        pass={{
                          name: guests[activeGuest]?.name ?? "",
                          tableLabel: selectedConfig.label,
                          photo: guests[activeGuest]?.photo ?? "",
                          id: guests[activeGuest]?.passId ?? "",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Past Editions photo section ── */}
      <div className="border-t border-white/10">
        <div className="px-5 sm:px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Past Editions</span>
          </div>
          <h2 className="text-white leading-none mb-4" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 7vw, 96px)" }}>
            THE NIGHTS SO FAR.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>A glimpse into what ACCESS looks like.</p>
        </div>

        <div className="grid grid-cols-2 gap-0">
          {accessPhotos.map((photo, i) => (
            <div key={i} className="relative overflow-hidden group h-64 sm:h-80 lg:h-96">
              {photo.src ? (
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className={`absolute inset-0 w-full h-full object-cover ${photo.position} grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700`}
                />
              ) : (
                <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                  <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-white/20 text-xs uppercase tracking-widest">
                    Photo {i + 1}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
