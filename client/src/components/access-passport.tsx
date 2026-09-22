import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { ChevronDown, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PassportCard } from "@/components/passport-card";
import type { PassFields } from "@/components/passport-card";
import { MediaLightbox } from "@/components/media-lightbox";
import type { AccessEvent, GalleryPhoto } from "@shared/schema";

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PHONE = "23055151185";
const R2 = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures";
// Fallback defaults, used only until an ACCESS event is created in the admin,
// or when a specific field (lineup, early-bird pricing) is left unset on it.
// The poster fallback is a generic crowd shot, not a real poster graphic —
// admin should upload the actual poster per edition in Admin → ACCESS Events.
const DEFAULT_POSTER_URL = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures/Serge_53.jpg";
const DEFAULT_BANNER_URL = `${R2}/Serge_59.jpg`;
const DEFAULT_DATE = "Friday 3 July 2026";
const DEFAULT_VENUE = "Club Sixty Nine";
const DEFAULT_TIME = "Doors Open 8PM";
const DEFAULT_EARLY_BIRD_PRICE = 350;
const DEFAULT_REGULAR_PRICE = 500;

interface LineupEntry {
  name: string;
  origin: string;
  genres: string;
}

function parseLineup(json: string | null | undefined): LineupEntry[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// How many guest slots the reservation form collects up front for each
// table type — also doubles as the "is this a flat-price table or a
// variable-size section" signal below: table_4/table_5 always book out to
// their maxGuests for one flat price (minGuests is just "book with as few
// as 1 and still pay full price"), while section_8_12 is genuinely
// variable (8–12 guests, priced per person within that range).
const FIXED_COUNTS: Record<string, number> = {
  table_4: 4,
  table_5: 5,
  section_8_12: 8,
};

function computeTotalLabel(key: string, item: { price: number; pricePerPerson: number; minGuests: number; maxGuests: number }): string {
  if (FIXED_COUNTS[key] === item.maxGuests) {
    return `MUR ${item.price.toLocaleString()} total`;
  }
  const lo = item.pricePerPerson * item.minGuests;
  const hi = item.pricePerPerson * item.maxGuests;
  return `MUR ${lo.toLocaleString()}–${hi.toLocaleString()} · final total confirmed on approval`;
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

  const { data: currentEventData } = useQuery<{ success: boolean; event: AccessEvent | null }>({
    queryKey: ["/api/access/current"],
  });
  const currentEvent = currentEventData?.event ?? null;
  const posterUrl = currentEvent?.posterUrl || DEFAULT_POSTER_URL;
  const bannerUrl = currentEvent?.bannerUrl || DEFAULT_BANNER_URL;
  const eventDate = currentEvent?.date || DEFAULT_DATE;
  const eventVenue = currentEvent?.venue || DEFAULT_VENUE;
  const eventTime = currentEvent?.time || DEFAULT_TIME;
  const eventName = currentEvent?.name?.trim() || "ACCESS";
  const eventDescription = currentEvent?.description?.trim() || "";
  const eventCollaborators = currentEvent?.collaborators?.trim() || "";
  // Best-effort year for the banner caption — falls back to no year rather
  // than a hardcoded one when the admin's free-text date doesn't parse.
  const eventYear = (() => {
    const parsed = new Date(eventDate);
    return isNaN(parsed.getTime()) ? "" : String(parsed.getFullYear());
  })();
  const lineup = parseLineup(currentEvent?.lineupJson);
  const earlyBirdPrice = currentEvent?.earlyBirdPrice ?? DEFAULT_EARLY_BIRD_PRICE;
  const regularPrice = currentEvent?.regularPrice ?? DEFAULT_REGULAR_PRICE;

  // General entry state — early-bird pricing is entirely driven by this
  // edition's own deadline; no deadline configured means it's simply off.
  const earlyBird = !!currentEvent?.earlyBirdDeadline && new Date() < new Date(currentEvent.earlyBirdDeadline);
  const [geName, setGeName] = useState("");
  const [gePhone, setGePhone] = useState("");
  const [sendingGeneral, setSendingGeneral] = useState(false);

  // ── Past Editions gallery (admin-managed, Admin → ACCESS Gallery) ──
  const { data: allGalleryItems = [], isLoading: galleryLoading } = useQuery<{ success: boolean; photos: GalleryPhoto[] }, Error, GalleryPhoto[]>({
    queryKey: ["/api/gallery"],
    select: (data) => data.photos ?? [],
  });
  const galleryItems = useMemo(() => allGalleryItems.filter((p) => p.section === "access"), [allGalleryItems]);
  const [galleryTab, setGalleryTab] = useState<"photos" | "videos">("photos");
  const galleryFiltered = useMemo(
    () => galleryItems.filter((p) => (p.type === "video") === (galleryTab === "videos")),
    [galleryItems, galleryTab],
  );
  const GALLERY_PAGE_SIZE = 8;
  const [galleryVisibleCount, setGalleryVisibleCount] = useState(GALLERY_PAGE_SIZE);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);
  const galleryDisplayed = galleryFiltered.slice(0, galleryVisibleCount);
  const galleryHasMore = galleryVisibleCount < galleryFiltered.length;
  const selectGalleryTab = (tab: "photos" | "videos") => {
    setGalleryTab(tab);
    setGalleryVisibleCount(GALLERY_PAGE_SIZE);
    setGalleryLightboxIndex(null);
  };
  const openGalleryLightbox = (idx: number) => setGalleryLightboxIndex(idx);
  const closeGalleryLightbox = () => setGalleryLightboxIndex(null);
  const prevGalleryItem = () => setGalleryLightboxIndex((i) => i !== null ? (i - 1 + galleryFiltered.length) % galleryFiltered.length : null);
  const nextGalleryItem = () => setGalleryLightboxIndex((i) => i !== null ? (i + 1) % galleryFiltered.length : null);

  // Editions whose date has already passed — the hero/RSVP section above
  // only ever shows the current upcoming edition, so a past one still needs
  // somewhere to list its name/date/venue instead of just vanishing.
  const { data: pastAccessEvents = [] } = useQuery<{ success: boolean; events: AccessEvent[] }, Error, AccessEvent[]>({
    queryKey: ["/api/access/past"],
    select: (data) => data.events ?? [],
  });

  // Client-side route changes (wouter) don't trigger the browser's native
  // scroll-to-hash behavior the way a full page load does, so a link like
  // /access#past-editions needs a manual nudge once this page has mounted.
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const el = document.querySelector(window.location.hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
  }, []);

  // Fetch inventory on mount — price/pricePerPerson/capacity/guest range all
  // come from the server (admin-editable in Admin → ACCESS → Pricing) and
  // override the local fallback; only `description` has no server column.
  useEffect(() => {
    fetch("/api/access/capacity")
      .then((r) => r.json())
      .then((data) => {
        const merged: Record<string, InventoryItem> = {};
        for (const key of Object.keys(TABLE_CONFIG)) {
          const local = TABLE_CONFIG[key];
          const server = data[key] || {};
          const item = { ...local, ...server, used: server.used ?? 0 };
          merged[key] = { ...item, totalLabel: computeTotalLabel(key, item) };
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

  async function handleGeneralEntryWA() {
    if (!geName.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }

    // Open the tab synchronously, before the request below — mobile browsers
    // revoke "this came from a tap" permission the moment we await anything.
    const waWindow = window.open("", "_blank");

    setSendingGeneral(true);
    try {
      await fetch("/api/access/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableType: "single_entry",
          guests: [{ name: geName.trim(), phone: gePhone.trim() }],
        }),
      });
    } catch {}

    const tierLabel = earlyBird ? `Early Bird MUR ${earlyBirdPrice}` : `General Entry MUR ${regularPrice}`;
    const msg =
      `Hi, I'd like to reserve a General Entry ticket for ACCESS on ${eventDate} at ${eventVenue}.\n\n` +
      `Ticket: ${tierLabel}\n` +
      `Name: ${geName.trim()}\n` +
      `Phone: ${gePhone.trim() || "—"}\n\n` +
      `Looking forward to hearing from you.`;
    const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`;
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      window.open(waUrl, "_blank");
    }

    setSendingGeneral(false);
    toast({ title: "Request received", description: "We'll confirm your General Entry pass via WhatsApp once payment is complete." });
  }

  async function sendAllPasses() {
    if (!selectedTable || !selectedConfig) return;

    const unfilled = guests.findIndex((g) => !g.name.trim());
    if (unfilled !== -1) {
      setActiveGuest(unfilled);
      toast({ title: `Please fill in the name for Guest ${unfilled + 1}`, variant: "destructive" });
      return;
    }

    // Open the tab synchronously, before the request below — mobile browsers
    // (Safari especially) revoke "this came from a tap" permission the
    // moment we await anything, so opening after the fetch gets silently
    // blocked. Navigating an already-open window afterward isn't blocked.
    const waWindow = window.open("", "_blank");

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

    const adminMsg =
      `NEW ACCESS RESERVATION\n\n` +
      `Table: ${selectedConfig.label}\n` +
      `Price: MUR ${selectedConfig.pricePerPerson} per person \u00b7 ${selectedConfig.totalLabel}\n` +
      `Date: ${eventDate}\n` +
      `Venue: ${eventVenue}\n` +
      `Note: Entry tickets only \u2014 no drinks included\n\n` +
      `Guests (${guests.length} ${guests.length === 1 ? "person" : "people"}):\n` +
      guestLines +
      `\n\nAwaiting payment confirmation.`;

    const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(adminMsg)}`;
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      window.open(waUrl, "_blank");
    }

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

      {/* ── Section 2: Banner Image (hidden on mobile) ── */}
      <div className="hidden sm:block my-12 px-5 sm:px-6 lg:px-12">
        <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden">
          <img src={bannerUrl} alt="ACCESS experience" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <p className="absolute bottom-8 left-5 sm:left-6 lg:left-12 text-white/30 text-[9px] uppercase tracking-[0.3em]">{eventName}{eventYear ? ` · ${eventYear}` : ""}</p>
        </div>
      </div>

      {/* ── Section 3: Event Poster + Info ── */}
      <div className="border-b border-white/10 py-12 px-5 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Poster */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <img
              src={posterUrl}
              alt="ACCESS event poster"
              className="shadow-2xl w-full max-w-[380px] object-cover"
              loading="lazy"
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
              {eventName}
            </h2>
            <p className="text-[#c9962a]/60 text-[11px] uppercase tracking-[0.3em] mb-6">An AFTR Private Social Night</p>
            {eventDescription && (
              <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-lg">{eventDescription}</p>
            )}

            <div className="border-t border-white/10 pt-6 mb-6 space-y-3">
              {[
                ["DATE", eventDate],
                ["VENUE", eventVenue],
                ["TIME", eventTime],
                ["CONTACT", "+230 5515 1185"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-4">
                  <span className="text-[#c9962a] text-[9px] uppercase tracking-[0.25em] w-16 shrink-0">{label}</span>
                  <span className="text-white text-sm font-mono">{value}</span>
                </div>
              ))}
            </div>

            {lineup.length > 0 && (
              <div className="border-t border-white/10 pt-6 mb-6">
                <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em] mb-4">DJ Lineup</p>
                <div className="grid grid-cols-2 gap-3">
                  {lineup.map((dj, i) => (
                    <div key={`${dj.name}-${i}`} className="border border-white/8 p-3">
                      <p className="text-white leading-none mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px" }}>{dj.name}</p>
                      {dj.origin && <p className="text-[#c9962a] text-[8px] uppercase tracking-[0.25em] mb-1">{dj.origin}</p>}
                      {dj.genres && <p className="text-white/30 text-[9px]">{dj.genres}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {eventCollaborators && (
              <p className="text-white/25 text-[10px] mb-6">In collaboration with {eventCollaborators}</p>
            )}

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
                      MUR {earlyBird ? earlyBirdPrice : regularPrice}
                    </p>
                    {earlyBird && (
                      <p className="text-white/30 text-[11px] line-through font-mono">MUR {regularPrice}</p>
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
                    <label htmlFor="ge-name" className={labelCls}>Your Name *</label>
                    <input
                      id="ge-name"
                      type="text"
                      value={geName}
                      onChange={(e) => setGeName(e.target.value)}
                      placeholder="Full name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ge-phone" className={labelCls}>WhatsApp Number (Optional)</label>
                    <input
                      id="ge-phone"
                      type="tel"
                      value={gePhone}
                      onChange={(e) => setGePhone(e.target.value)}
                      placeholder="+230 5XXX XXXX"
                      className={inputCls}
                    />
                  </div>
                  <button
                    onClick={handleGeneralEntryWA}
                    disabled={sendingGeneral}
                    className="flex items-center gap-2 bg-[#c72d28] hover:bg-[#a01f1f] disabled:opacity-40 text-white text-[9px] uppercase tracking-[0.2em] font-bold px-6 py-3.5 transition-colors self-start"
                  >
                    <SiWhatsapp className="w-3 h-3" />
                    {sendingGeneral ? "Sending..." : "Reserve via WhatsApp"}
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
              <p className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: "rgba(201,150,42,0.6)" }}>{eventDate} · {eventVenue}</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.entries(TABLE_CONFIG).map(([key, fallback]) => {
                  const config = inventory[key] ?? fallback;
                  const used = inventory[key]?.used ?? 0;
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
                      <p className="text-[#c9962a] text-[13px] font-mono font-medium mb-0.5">MUR {config.pricePerPerson} per person</p>
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
                        <label htmlFor={`guest-name-${i}`} className={labelCls}>Full Name *</label>
                        <input
                          id={`guest-name-${i}`}
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
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileRefs.current[i]?.click(); }}
                          className="w-full border border-dashed border-white/10 hover:border-[#c9962a]/25 transition-colors cursor-pointer p-4 text-center"
                          aria-label={guest.photo ? `Photo ready for Guest ${i + 1} — tap to change` : `Upload photo for Guest ${i + 1}`}
                        >
                          <input
                            ref={(el) => { fileRefs.current[i] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(i, f); }}
                          />
                          {guest.photo ? (
                            <div className="flex items-center gap-3">
                              <img src={guest.photo} alt="" className="w-9 h-11 object-cover object-top" />
                              <span className="text-white/35 text-[9px] uppercase tracking-[0.18em]">Photo ready · tap to change</span>
                            </div>
                          ) : (
                            <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">Upload photo</span>
                          )}
                        </button>
                      </div>

                      <div>
                        <label htmlFor={`guest-phone-${i}`} className={labelCls}>WhatsApp Number (Optional)</label>
                        <input
                          id={`guest-phone-${i}`}
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
                      <p className="text-[#c9962a] text-xs font-mono">MUR {selectedConfig.pricePerPerson} per person</p>
                      <p className="text-white/30 text-[9px] font-mono mt-0.5">{selectedConfig.totalLabel}</p>
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
                      {sending ? "Confirming..." : "Confirm Table Reservation"}
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
                          date: eventDate,
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

      {/* ── Past Editions gallery ── */}
      <div id="past-editions" className="border-t border-white/10 scroll-mt-24">
        <div className="px-5 sm:px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Past Editions</span>
          </div>
          <h2 className="text-white leading-none mb-4" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 7vw, 96px)" }}>
            THE NIGHTS SO FAR.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }} className="mb-8">A glimpse into what ACCESS looks like.</p>

          {pastAccessEvents.length > 0 && (
            <div className="mb-10 space-y-0 border border-white/10 max-w-xl">
              {pastAccessEvents.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10 last:border-0">
                  <span className="text-white text-sm">{ev.name}</span>
                  <span className="text-white/30 text-xs font-mono text-right">
                    {ev.date}{ev.venue ? ` · ${ev.venue}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Photos / Videos tab */}
          {galleryItems.length > 0 && (
            <div className="flex gap-0 border border-white/10 w-fit">
              {(["photos", "videos"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => selectGalleryTab(tab)}
                  className={`px-8 py-3 text-[10px] uppercase tracking-[0.25em] font-bold transition-colors border-r border-white/10 last:border-0 ${
                    galleryTab === tab ? "bg-[#c9962a] text-black" : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {galleryLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="px-5 sm:px-6 lg:px-12 pb-16">
            <p className="text-white/20 text-sm">No photos or videos yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-0">
              {galleryDisplayed.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openGalleryLightbox(galleryFiltered.indexOf(item))}
                  aria-label={`View ${item.type === "video" ? "video" : "photo"}: ${item.alt || "ACCESS"}`}
                  className="relative overflow-hidden group h-64 sm:h-80 lg:h-96 text-left"
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      preload="metadata"
                      muted
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />
                  )}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/50 border border-white/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                </button>
              ))}
            </div>

            {galleryFiltered.length === 0 && (
              <div className="px-5 sm:px-6 lg:px-12 pb-16">
                <p className="text-white/20 text-sm">No {galleryTab} yet.</p>
              </div>
            )}

            {galleryHasMore && (
              <div className="flex flex-col items-center gap-3 py-12">
                <button
                  onClick={() => setGalleryVisibleCount((c) => c + GALLERY_PAGE_SIZE)}
                  className="border border-white/15 text-white/50 hover:text-white hover:border-[#c9962a]/50 text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-3.5 transition-colors"
                >
                  Load More
                </button>
                <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">
                  {galleryDisplayed.length} of {galleryFiltered.length}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {galleryLightboxIndex !== null && (
          <MediaLightbox
            items={galleryFiltered}
            index={galleryLightboxIndex}
            onClose={closeGalleryLightbox}
            onPrev={prevGalleryItem}
            onNext={nextGalleryItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
