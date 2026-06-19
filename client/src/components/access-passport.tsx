import { useState, useRef, useEffect } from "react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

// ─── Table config (mirrors server TABLE_INVENTORY) ────────────────────────────
const TABLE_CONFIG: Record<string, {
  label: string;
  price: number;
  capacity: number;
  maxGuests: number;
  minGuests: number;
  description: string;
}> = {
  table_4: {
    label: "Table for 4",
    price: 4000,
    capacity: 5,
    maxGuests: 4,
    minGuests: 1,
    description: "Intimate reserved table for your group of 4. Includes dedicated server and bottle service.",
  },
  table_5: {
    label: "Table for 5",
    price: 5000,
    capacity: 5,
    maxGuests: 5,
    minGuests: 1,
    description: "Reserved table for 5 with premium positioning. Dedicated server and bottle service included.",
  },
  section_8_12: {
    label: "Section (8\u201312 guests)",
    price: 8000,
    capacity: 3,
    maxGuests: 12,
    minGuests: 8,
    description: "Exclusive section for larger groups. Prime floor placement, bottle service, and dedicated host.",
  },
};

type TableKey = keyof typeof TABLE_CONFIG;

interface InventoryItem {
  label: string;
  price: number;
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
function fmtPrice(n: number) {
  return "MUR " + n.toLocaleString();
}

// ─── Passport Card ────────────────────────────────────────────────────────────
interface PassFields {
  name: string;
  tableLabel: string;
  photo: string;
  id: string;
}

function PassportCard({ pass }: { pass: PassFields }) {
  const fields = [
    { label: "Name:", value: pass.name || "\u2014" },
    { label: "Place of Access:", value: "Mauritius" },
    { label: "Table:", value: pass.tableLabel ? pass.tableLabel.toUpperCase() : "\u2014" },
    { label: "Date:", value: "27 JULY 2026" },
  ];

  return (
    <div
      style={{
        width: "100%",
        border: "3px solid #7a1515",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        fontFamily: "'DM Mono', monospace",
        background: "linear-gradient(170deg, #f2ede0 0%, #e9e2cc 100%)",
        position: "relative",
      }}
    >
      {/* Paper lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,0,0,0.02) 18px, rgba(0,0,0,0.02) 19px)",
        }}
      />

      {/* Globe watermark */}
      <svg
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "180px",
          height: "180px",
          opacity: 0.05,
          pointerEvents: "none",
          zIndex: 0,
        }}
        viewBox="0 0 260 180"
        fill="none"
      >
        <ellipse cx="130" cy="90" rx="120" ry="78" stroke="black" strokeWidth="1.2" />
        <ellipse cx="130" cy="90" rx="80"  ry="78" stroke="black" strokeWidth="0.9" />
        <ellipse cx="130" cy="90" rx="40"  ry="78" stroke="black" strokeWidth="0.9" />
        <line x1="10" y1="90"  x2="250" y2="90"  stroke="black" strokeWidth="1"   />
        <line x1="10" y1="55"  x2="250" y2="55"  stroke="black" strokeWidth="0.7" />
        <line x1="10" y1="125" x2="250" y2="125" stroke="black" strokeWidth="0.7" />
      </svg>

      {/* Gold top bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)" }} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 18px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "38px",
              letterSpacing: "0.18em",
              lineHeight: 1,
              background: "linear-gradient(135deg,#c9962a 0%,#f5d76e 50%,#b8860b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ACCESS
          </div>
          <div
            style={{
              fontSize: "8px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.35)",
              paddingLeft: "2px",
              marginTop: "2px",
            }}
          >
            Private Social Club · Member Pass
          </div>
        </div>
        <div
          style={{
            width: "30px",
            height: "30px",
            border: "1.5px solid rgba(122,21,21,0.38)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "15px",
            color: "rgba(122,21,21,0.55)",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          A
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "96px 1fr",
          gap: "16px",
          padding: "16px 18px",
          position: "relative",
          zIndex: 1,
          alignItems: "stretch",
        }}
      >
        {/* Photo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: "96px",
              height: "118px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "rgba(0,0,0,0.06)",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {pass.photo ? (
              <img
                src={pass.photo}
                alt="member"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                }}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(0,0,0,0.13)" }} />
                <div style={{ width: "46px", height: "26px", borderRadius: "50% 50% 0 0", background: "rgba(0,0,0,0.09)" }} />
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: "6px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.28)",
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            {pass.photo ? "Member Photo" : "Upload Photo"}
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "stretch" }}>
          {fields.map((f, i, arr) => (
            <div
              key={f.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "5px 0",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.35)", marginBottom: "2px" }}>
                {f.label}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", fontWeight: "500", color: "#1a1a1a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "11px 18px 15px",
          borderTop: "1px solid rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.3)", marginBottom: "1px" }}>
            Pass ID:
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "rgba(0,0,0,0.42)", letterSpacing: "0.1em" }}>
            {pass.id}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "rgba(0,0,0,0.3)", marginBottom: "1px" }}>
            Signature:
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "13px", color: "rgba(0,0,0,0.42)" }}>
            After Dark Socials
          </div>
        </div>
      </div>

      {/* Gold bottom bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg,#b8860b,#f5d76e,#c9962a,#f5d76e,#b8860b)" }} />
    </div>
  );
}

// ─── R2 photo strip ───────────────────────────────────────────────────────────
const R2 = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures";

const accessPhotos: { src: string | null; position: string; alt: string }[] = [
  { src: `${R2}/Serge_53.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_82.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_70.jpg`, position: "object-center", alt: "ACCESS experience" },
  { src: `${R2}/Serge_47.jpg`, position: "object-bottom", alt: "ACCESS experience" },
  { src: `${R2}/Serge_49.jpg`, position: "object-bottom", alt: "ACCESS experience" },
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

  // Fetch inventory on mount
  useEffect(() => {
    fetch("/api/access/capacity")
      .then((r) => r.json())
      .then((data) => {
        // Merge server data with local config for descriptions/minGuests
        const merged: Record<string, InventoryItem> = {};
        for (const key of Object.keys(TABLE_CONFIG)) {
          const local = TABLE_CONFIG[key];
          const server = data[key] || {};
          merged[key] = { ...local, used: server.used ?? 0 };
        }
        setInventory(merged);
      })
      .catch(() => {
        // Fall back to local config with 0 used
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

  // Fixed guest counts per table type
  const FIXED_COUNTS: Record<TableKey, number> = {
    table_4: 4,
    table_5: 5,
    section_8_12: 8,
  };

  // When a table is selected, immediately generate the fixed set of guest forms
  function selectTable(key: TableKey) {
    setSelectedTable(key);
    setActiveGuest(0);
    const count = FIXED_COUNTS[key];
    const newGuests: GuestData[] = Array.from({ length: count }, (_, i) =>
      guests[i] ?? { name: "", photo: "", phone: "", passId: rndId() }
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
          guests: guests.map(({ name, phone, passId }) => ({ name, phone, passId })),
          date: "27 July 2026",
        }),
      });

      // Update local inventory
      setInventory((prev) => {
        if (!prev[selectedTable]) return prev;
        return { ...prev, [selectedTable]: { ...prev[selectedTable], used: prev[selectedTable].used + 1 } };
      });
    } catch {}

    // Admin WhatsApp
    const guestLines = guests
      .map((g, i) => {
        const parts = [`${i + 1}. ${g.name.toUpperCase()}`, g.passId];
        if (g.phone) parts.push(g.phone);
        return parts.join(" \u2014 ");
      })
      .join("\n");

    const adminMsg =
      `ACCESS RESERVATION\n` +
      `Table: ${selectedConfig.label}\n` +
      `Date: 27 July 2026\n` +
      `Total: ${fmtPrice(selectedConfig.price)}\n` +
      `Guests (${guests.length} ${guests.length === 1 ? "person" : "people"}):\n` +
      guestLines;

    window.open(`https://wa.me/23058205220?text=${encodeURIComponent(adminMsg)}`, "_blank");

    // Individual guest WhatsApp (1 s delay per guest)
    guests.forEach((g, i) => {
      if (!g.phone.trim()) return;
      const clean = g.phone.replace(/\s+/g, "").replace(/^\+/, "");
      const msg =
        `ACCESS MEMBER PASS\n\n` +
        `Name: ${g.name.toUpperCase()}\n` +
        `Table: ${selectedConfig.label.toUpperCase()}\n` +
        `Date: 27 July 2026\n` +
        `Pass ID: ${g.passId}\n\n` +
        `Present this pass at the door.\n` +
        `After Dark Socials - @afterdarksocials.mu`;
      setTimeout(() => window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank"), 1000 * (i + 1));
    });

    setSending(false);
    toast({ title: "Passes sent!", description: "WhatsApp opened for admin and each guest." });
  }

  // Shared style tokens
  const labelCls = "block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2";
  const inputCls =
    "w-full bg-transparent border-0 border-b border-white/15 text-white placeholder:text-white/20 text-sm px-0 py-3 focus:outline-none focus:border-[#c9962a]/50 transition-colors font-mono";

  return (
    <div className="min-h-screen bg-black text-white pt-28">

      {/* ── Section 1: Header ── */}
      <div className="px-5 sm:px-6 lg:px-12 pb-12 border-b border-white/10">
        <div className="flex items-center gap-4 mb-16">
          <span className="w-8 h-px bg-[#c9962a]" />
          <span className="text-[#c9962a] text-[10px] uppercase tracking-[0.35em]">Exclusive Experience</span>
        </div>
        <h1
          className="font-black text-white leading-none mb-6"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(56px, 10vw, 140px)" }}
        >
          RSVP FOR
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#c9962a,#f5d76e,#b8860b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
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
          <img
            src={`${R2}/Serge_59.jpg`}
            alt="ACCESS experience"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <p className="absolute bottom-8 left-5 sm:left-6 lg:left-12 text-white/30 text-[9px] uppercase tracking-[0.3em]">
            ACCESS · Vol. 3 · 2025
          </p>
        </div>
      </div>

      {/* ── Reservation content ── */}
      <div className="px-5 sm:px-6 lg:px-12 pb-20">

        {/* ── Fully booked state ── */}
        {allSoldOut ? (
          <div className="border border-[#c72d28]/30 bg-[#c72d28]/8 px-8 py-12 text-center max-w-lg mx-auto">
            <div
              className="font-black text-[#c72d28] mb-3"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "32px" }}
            >
              FULLY BOOKED
            </div>
            <p className="text-white/40 text-sm">
              ACCESS is at full capacity. Follow{" "}
              <span className="text-white/60">@afterdarksocials.mu</span> for updates on future events.
            </p>
          </div>
        ) : (
          <>
            {/* ── Step 1: Table selection ── */}
            <div className="mb-10">
              <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em] mb-6">Select Your Table</p>
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
                          ? "opacity-40 pointer-events-none border-white/10"
                          : isSelected
                          ? "border-[#c9962a] bg-[#c9962a]/8"
                          : "border-white/10 hover:border-[#c9962a]/50",
                      ].join(" ")}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className="text-white leading-none"
                          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "22px" }}
                        >
                          {config.label}
                        </span>
                        <span className="text-[#c9962a] text-sm font-mono font-medium ml-3 shrink-0">
                          {fmtPrice(config.price)}
                        </span>
                      </div>

                      {/* Capacity pill */}
                      <p className="text-[#c9962a]/70 text-[9px] uppercase tracking-[0.25em] mb-2">
                        Up to {config.maxGuests} guests
                      </p>

                      {/* Remaining */}
                      {!soldOut && (
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] mb-3">
                          {remaining} {remaining === 1 ? "table" : "tables"} remaining
                        </p>
                      )}
                      {soldOut && (
                        <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.2em] mb-3 font-bold">
                          Sold Out
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-white/40 text-xs leading-relaxed">{config.description}</p>
                    </button>
                  );
                })}
              </div>
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
                      <p className="text-[#c9962a] text-[10px] uppercase tracking-[0.3em] mb-6">
                        Guest {i + 1}
                      </p>

                      {/* Name */}
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

                      {/* Photo */}
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
                              <span className="text-white/35 text-[9px] uppercase tracking-[0.18em]">
                                Photo ready · tap to change
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">
                              Upload photo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp */}
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
                        <p className="text-white/20 text-[9px] mt-1.5 uppercase tracking-[0.15em]">
                          Their pass will be sent here
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Summary + send */}
                  <div className="border-t border-white/10 pt-8 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white text-sm font-mono">{selectedConfig.label}</p>
                      <p className="text-[#c9962a] text-xs font-mono">{fmtPrice(selectedConfig.price)}</p>
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
            )}
          </>
        )}
      </div>

      {/* ── Past Editions photo section ─────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="px-5 sm:px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Past Editions</span>
          </div>
          <h2
            className="text-white leading-none mb-4"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 7vw, 96px)" }}
          >
            THE NIGHTS SO FAR.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            A glimpse into what ACCESS looks like.
          </p>
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
                  <span
                    style={{ fontFamily: "'DM Mono', monospace" }}
                    className="text-white/20 text-xs uppercase tracking-widest"
                  >
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
