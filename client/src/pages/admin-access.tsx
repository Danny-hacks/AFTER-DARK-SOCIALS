import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Check, X, Clock, ChevronDown, ChevronUp, Download, MessageSquare, Plus, Trash2, Pencil, Save, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PassportCard, type PassFields } from "@/components/passport-card";
import { generatePassPDF, buildPassPDF, passFileName } from "@/lib/generatePassCanvas";
import { shareFilesToWhatsApp, shareOutcomeToast, type ShareOutcome } from "@/lib/shareFiles";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ACCESS_AREAS, ACCESS_AREA_LABELS, ACCESS_SOLO_AREA, type AccessTableInventory, type AccessEvent } from "@shared/schema";
import {
  accessAreaLabel,
  accessPassPrefix,
  accessTicketTypeFullLabel,
  accessTicketTypeTotal,
  type AccessTicketTypeWithAvailability,
} from "@shared/accessTickets";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Guest {
  name: string;
  phone?: string;
  passId: string;
  notes?: string;
}

interface Reservation {
  id: string;
  tableType: string;
  tableLabel: string;
  guestsJson: string;
  status: "pending_payment" | "approved" | "rejected";
  source?: string;
  eventId?: string | null;
  ticketTypeId?: string | null;
  createdAt: string;
  approvedAt: string | null;
}

interface TableCounts {
  confirmed: number;
  pending: number;
}

interface ReservationsResponse {
  success: boolean;
  reservations: Reservation[];
  counts: Record<string, TableCounts>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function parseGuests(json: string): Guest[] {
  try { return JSON.parse(json); } catch { return []; }
}

// The person who booked is guest 1 on public reservations; fall back to the
// first guest who left a number.
function bookerOf(guests: Guest[]): Guest | undefined {
  return guests[0]?.phone?.trim() ? guests[0] : guests.find((g) => g.phone?.trim()) ?? guests[0];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminAccessPage() {
  const { toast } = useToast();
  // Deep-linked from global search (?q=name) — falls back to empty when
  // navigated to directly.
  const initialQuery = new URLSearchParams(useSearch()).get("q") ?? "";

  // FIX 3 — preload DM Mono + Bebas Neue into the document font set so
  // html2canvas always finds them loaded (avoids glitched-character exports)
  useEffect(() => {
    const fonts = [
      new FontFace("DM Mono", "url(https://fonts.gstatic.com/s/dmmono/v14/aFTR7PB1QTsUX8KYvrGyIYetlY4.woff2)"),
      new FontFace("Bebas Neue", "url(https://fonts.gstatic.com/s/bebasneuepro/v3/fC1MPYA5ZYrSF0NpB0YOmOiGz9h5.woff2)"),
    ];
    fonts.forEach((font) => {
      font.load().then((f) => document.fonts.add(f)).catch(() => {});
    });
  }, []);

  // ── Data ──
  const { data, isLoading } = useQuery<ReservationsResponse>({
    queryKey: ["/api/admin/access/reservations"],
    select: (d) => d,
  });

  const { data: inventory = [] } = useQuery<{ success: boolean; inventory: AccessTableInventory[] }, Error, AccessTableInventory[]>({
    queryKey: ["/api/admin/access/inventory"],
    select: (d) => d.inventory ?? [],
  });

  const { data: currentEventData } = useQuery<{ success: boolean; event: AccessEvent | null }>({
    queryKey: ["/api/access/current"],
  });
  const currentEvent = currentEventData?.event ?? null;
  const currentEventDate = currentEvent?.date || "TBA";
  const currentEventVenue = currentEvent?.venue || "TBA";
  const inventoryMap: Record<string, AccessTableInventory> = {};
  for (const row of inventory) inventoryMap[row.tableType] = row;
  // Table options now live per edition (access_ticket_types); only Solo
  // Entry still uses the global inventory row.
  const TABLE_TYPES = ["single_entry"];

  const { data: editions = [] } = useQuery<{ success: boolean; events: AccessEvent[] }, Error, AccessEvent[]>({
    queryKey: ["/api/admin/access/events"],
    select: (d) => d.events ?? [],
  });
  const editionById: Record<string, AccessEvent> = {};
  for (const e of editions) editionById[e.id] = e;

  const { data: allTicketTypes = [] } = useQuery<
    { success: boolean; ticketTypes: AccessTicketTypeWithAvailability[] },
    Error,
    AccessTicketTypeWithAvailability[]
  >({
    queryKey: ["/api/admin/access/ticket-types"],
    select: (d) => d.ticketTypes ?? [],
  });
  const ticketTypeById: Record<string, AccessTicketTypeWithAvailability> = {};
  for (const t of allTicketTypes) ticketTypeById[t.id] = t;
  const currentTicketTypes = currentEvent ? allTicketTypes.filter((t) => t.eventId === currentEvent.id) : [];

  // Which edition the stats, availability and list are showing.
  // "current" = the upcoming edition (empty once it's passed, until the next
  // one is created); "all" = every reservation ever.
  const [edition, setEdition] = useState<string>(initialQuery ? "all" : "current");
  const selectedEventId = edition === "current" ? currentEvent?.id ?? null : edition === "all" ? null : edition;
  const selectedEdition = selectedEventId ? editionById[selectedEventId] : undefined;

  // Date/venue for a reservation's pass — from its own edition.
  function eventInfoFor(r: Reservation) {
    const ev = r.eventId ? editionById[r.eventId] : undefined;
    return { date: ev?.date || currentEventDate, venue: ev?.venue || currentEventVenue };
  }

  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: string; pricePerPerson: string; capacity: string; manualUsed: string }>({ price: "", pricePerPerson: "", capacity: "", manualUsed: "" });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ tableType, price, pricePerPerson, capacity, manualUsed }: { tableType: string; price: number; pricePerPerson: number; capacity: number; manualUsed: number | null }) =>
      apiRequest("PATCH", `/api/admin/access/inventory/${tableType}`, { price, pricePerPerson, capacity, manualUsed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access/capacity"] });
      toast({ title: "Pricing updated" });
      setEditingType(null);
    },
    onError: () => toast({ title: "Failed to update pricing", variant: "destructive" }),
  });

  const clearReservationsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/admin/access/reservations"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access/capacity"] });
      toast({ title: "All reservations cleared" });
    },
    onError: () => toast({ title: "Failed to clear reservations", variant: "destructive" }),
  });

  function startEditing(row: AccessTableInventory) {
    setEditingType(row.tableType);
    setEditValues({
      price: String(row.price),
      pricePerPerson: String(row.pricePerPerson),
      capacity: String(row.capacity),
      manualUsed: row.manualUsed != null ? String(row.manualUsed) : "",
    });
  }

  // ── Approve / reject mutations ──
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/access/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/ticket-types"] });
      toast({ title: "Reservation approved", description: "Payment confirmed — use Send Passes to dispatch." });
    },
    onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/access/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/ticket-types"] });
      toast({ title: "Pass deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/access/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/ticket-types"] });
      toast({ title: "Reservation rejected" });
    },
    onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
  });

  // ── Single pass form ──
  const [showIssueForm, setShowIssueForm]     = useState(false);
  const [singleName, setSingleName]           = useState("");
  const [singlePhone, setSinglePhone]         = useState("");
  // "single_entry" or a ticket type id from the current edition
  const [singleType, setSingleType]           = useState("single_entry");
  const [singleTableNum, setSingleTableNum]   = useState(1);
  const [singleNotes, setSingleNotes]         = useState("");
  const [singlePhoto, setSinglePhoto]         = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSinglePhoto(ev.target?.result as string ?? "");
    reader.readAsDataURL(file);
  }

  const singleTicketType = singleType === "single_entry" ? undefined : ticketTypeById[singleType];
  const singleIsSoloOption = singleTicketType?.area === ACCESS_SOLO_AREA;
  // Table number only applies to table options, not Solo Entry
  const needsTableNumber = !!singleTicketType && !singleIsSoloOption;
  const singleMaxTable = Math.max(1, singleTicketType?.capacity ?? 1);

  const computedTableLabel = !singleTicketType
    ? "Solo Entry"
    : singleIsSoloOption
      ? accessTicketTypeFullLabel(singleTicketType)
      : `${accessTicketTypeFullLabel(singleTicketType)} #${singleTableNum}`;

  // Preview only — the server assigns the next free ID on save.
  const livePassId = !singleTicketType
    ? "ACC-SE###"
    : singleIsSoloOption
      ? `ACC-${accessPassPrefix(singleTicketType)}-###`
      : `ACC-${accessPassPrefix(singleTicketType)}-${singleTableNum}###`;

  const singleBody = () => ({
    name: singleName,
    phone: singlePhone,
    ...(singleTicketType ? { ticketTypeId: singleTicketType.id, tableNumber: singleTableNum } : { tableType: "single_entry" }),
    notes: singleNotes,
  });

  const livePass: PassFields = {
    name: singleName,
    tableLabel: computedTableLabel,
    photo: singlePhoto,
    id: livePassId,
    date: currentEventDate,
  };

  const singleMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/access/single", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/ticket-types"] });
    },
    onError: () => toast({ title: "Failed to create pass", variant: "destructive" }),
  });

  function resetSingleForm() {
    setSingleName(""); setSinglePhone(""); setSingleType("single_entry");
    setSingleTableNum(1); setSingleNotes(""); setSinglePhoto("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  // Single pass actions
  async function handleSaveOnly() {
    if (!singleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const raw = await singleMutation.mutateAsync(singleBody());
    const res = await (raw as Response).json();
    resetSingleForm();
    toast({ title: "Pass saved", description: `Pass ID: ${res.passId}` });
  }

  async function handleDownloadPass() {
    if (!singleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const raw = await singleMutation.mutateAsync(singleBody());
    const res = await (raw as Response).json();
    const passId: string = res.passId;
    const tableLabel: string = res.tableLabel ?? computedTableLabel;
    console.log("[handleDownloadPass] passId:", passId, "tableLabel:", tableLabel);
    await generatePassPDF({ name: singleName, table: tableLabel, date: currentEventDate, venue: currentEventVenue, passId, photoUrl: singlePhoto || undefined });
    resetSingleForm();
    toast({ title: "Pass saved & downloaded", description: `ACCESS-PASS-${passId}.pdf` });
  }

  async function handleSendWhatsApp() {
    if (!singleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const raw = await singleMutation.mutateAsync(singleBody());
    const res = await (raw as Response).json();
    const passId: string = res.passId;
    const tableLabel: string = res.tableLabel ?? computedTableLabel;
    const blob = await buildPassPDF({ name: singleName, table: tableLabel, date: currentEventDate, venue: currentEventVenue, passId, photoUrl: singlePhoto || undefined });
    const outcome = await shareFilesToWhatsApp({
      files: [{ blob, name: passFileName(passId) }],
      title: `ACCESS Pass - ${singleName}`,
      phone: singlePhone,
      message: passMessage({ name: singleName, passId }, tableLabel, currentEventDate, currentEventVenue),
    });
    resetSingleForm();
    toast(shareToast(outcome, 1));
  }

  // Per-guest download / send
  async function downloadGuestPass(guest: Guest, r: Reservation) {
    const { date, venue } = eventInfoFor(r);
    await generatePassPDF({ name: guest.name, table: r.tableLabel, date, venue, passId: guest.passId, photoUrl: undefined });
    toast({ title: "Downloading…", description: `ACCESS-PASS-${guest.passId}.pdf` });
  }

  function passMessage(guest: { name: string; passId: string }, tableLabel: string, date: string, venue: string) {
    return (
      `Your ACCESS pass is confirmed.\n\n` +
      `Name: ${guest.name.toUpperCase()}\n` +
      `Table: ${tableLabel.toUpperCase()}\n` +
      `Date: ${date}\n` +
      `Venue: ${venue}\n` +
      `Pass ID: ${guest.passId}\n\n` +
      `Present this pass at the door.\n` +
      `After Dark Socials · @afterdarksocials.mu`
    );
  }

  function shareToast(outcome: ShareOutcome, count: number) {
    return shareOutcomeToast(outcome, count, "the booker's");
  }

  // Send one guest's pass to the person who booked the table.
  const [sendingId, setSendingId] = useState<string | null>(null);
  async function sendGuestPass(guest: Guest, r: Reservation) {
    const booker = bookerOf(parseGuests(r.guestsJson));
    const { date, venue } = eventInfoFor(r);
    setSendingId(`${r.id}:${guest.passId}`);
    try {
      const blob = await buildPassPDF({ name: guest.name, table: r.tableLabel, date, venue, passId: guest.passId });
      const outcome = await shareFilesToWhatsApp({
        files: [{ blob, name: passFileName(guest.passId) }],
        title: `ACCESS Pass - ${guest.name}`,
        phone: booker?.phone,
        message: passMessage(guest, r.tableLabel, date, venue),
      });
      toast(shareToast(outcome, 1));
    } catch {
      toast({ title: "Failed to generate pass", variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  }

  // Send every pass on the table to the person who booked, in one go.
  async function sendAllToBooker(r: Reservation) {
    const guests = parseGuests(r.guestsJson);
    const booker = bookerOf(guests);
    const { date, venue } = eventInfoFor(r);
    setSendingId(`${r.id}:all`);
    try {
      const files: { blob: Blob; name: string }[] = [];
      for (const g of guests) {
        files.push({
          blob: await buildPassPDF({ name: g.name, table: r.tableLabel, date, venue, passId: g.passId }),
          name: passFileName(g.passId),
        });
      }
      const message =
        `Your ACCESS table is confirmed.\n\n` +
        `Table: ${r.tableLabel.toUpperCase()}\n` +
        `Date: ${date}\n` +
        `Venue: ${venue}\n\n` +
        `Passes (${guests.length}):\n` +
        guests.map((g, i) => `${i + 1}. ${g.name.toUpperCase()} — ${g.passId}`).join("\n") +
        `\n\nEach guest presents their own pass at the door — forward them to your group.\n` +
        `After Dark Socials · @afterdarksocials.mu`;
      const outcome = await shareFilesToWhatsApp({
        files,
        title: `ACCESS Passes - ${r.tableLabel}`,
        phone: booker?.phone,
        message,
      });
      toast(shareToast(outcome, files.length));
    } catch {
      toast({ title: "Failed to generate passes", variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  }

  const allReservations = data?.reservations ?? [];
  // Everything below (stats, availability, list) follows the edition picker.
  const editionReservations = selectedEventId
    ? allReservations.filter((r) => r.eventId === selectedEventId)
    : edition === "all" ? allReservations : [];

  // Solo Entry counts for the selected edition
  const soloCounts = {
    confirmed: editionReservations.filter((r) => r.tableType === "single_entry" && r.status === "approved").length,
    pending: editionReservations.filter((r) => r.tableType === "single_entry" && r.status === "pending_payment").length,
  };
  const counts: Record<string, TableCounts> = { single_entry: soloCounts };

  const editionTicketTypes = selectedEventId ? allTicketTypes.filter((t) => t.eventId === selectedEventId) : [];

  // Area / ticket-type filter: "all" | "solo" | "area:<area>" | "type:<id>"
  const [kindFilter, setKindFilter] = useState<string>("all");
  const reservationArea = (r: Reservation): string | null =>
    r.ticketTypeId ? ticketTypeById[r.ticketTypeId]?.area ?? r.tableType : null;
  const matchesKind = (r: Reservation, f: string) =>
    f === "all" ? true
    : f === "solo" ? r.tableType === "single_entry" || r.tableType === ACCESS_SOLO_AREA
    : f.startsWith("area:") ? reservationArea(r) === f.slice(5)
    : f.startsWith("type:") ? r.ticketTypeId === f.slice(5)
    : true;
  const reservations = editionReservations.filter((r) => matchesKind(r, kindFilter));
  const activeArea = kindFilter.startsWith("area:")
    ? kindFilter.slice(5)
    : kindFilter.startsWith("type:") ? ticketTypeById[kindFilter.slice(5)]?.area ?? null : null;
  const typesInEditionReservations = (area: string) => {
    const ids = new Set(editionReservations.filter((r) => reservationArea(r) === area && r.ticketTypeId).map((r) => r.ticketTypeId!));
    const fromEdition = editionTicketTypes.filter((t) => t.area === area);
    for (const t of fromEdition) ids.add(t.id);
    return Array.from(ids).map((id) => ticketTypeById[id]).filter(Boolean);
  };

  const pending  = reservations.filter((r) => r.status === "pending_payment");
  const approved = reservations.filter((r) => r.status === "approved");
  const rejected = reservations.filter((r) => r.status === "rejected");

  // Expected revenue from confirmed table bookings (table options only)
  const confirmedTableRevenue = approved.reduce((sum, r) => {
    const t = r.ticketTypeId ? ticketTypeById[r.ticketTypeId] : undefined;
    return t && r.source !== "admin_single" ? sum + accessTicketTypeTotal(t, parseGuests(r.guestsJson).length) : sum;
  }, 0);

  const [statusFilter, setStatusFilter] = useState<"all" | "pending_payment" | "approved" | "rejected">("all");
  const statusFiltered =
    statusFilter === "all" ? [...pending, ...approved, ...rejected] : reservations.filter((r) => r.status === statusFilter);

  const [reservationSearch, setReservationSearch] = useState(initialQuery);
  const visibleReservations = reservationSearch.trim()
    ? statusFiltered.filter((r) => {
        const q = reservationSearch.trim().toLowerCase();
        const guests = parseGuests(r.guestsJson);
        return (
          r.tableLabel.toLowerCase().includes(q) ||
          guests.some((g) => g.name.toLowerCase().includes(q) || (g.phone ?? "").includes(q) || g.passId.toLowerCase().includes(q))
        );
      })
    : statusFiltered;

  const isBusy = singleMutation.isPending;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="ACCESS">

      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
          Reservations · confirm payment to approve and issue passes
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════
          ISSUE SINGLE PASS — collapsible panel
      ════════════════════════════════════════════════════════════ */}
      <div className="mb-12 border border-white/10">
        {/* Toggle header */}
        <button
          onClick={() => setShowIssueForm((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-3.5 h-3.5 text-[#c9962a]" />
            <span
              className="text-white font-black leading-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px" }}
            >
              Issue Single Pass
            </span>
          </div>
          {showIssueForm
            ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
            : <ChevronDown className="w-3.5 h-3.5 text-white/30" />
          }
        </button>

        {/* Form body */}
        {showIssueForm && (
          <div className="border-t border-white/10 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

              {/* ── Form (left) ── */}
              <div className="lg:col-span-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="Full name"
                    maxLength={30}
                    className="w-full bg-transparent border border-white/15 text-white text-sm px-4 py-3 placeholder-white/20 focus:outline-none focus:border-[#c9962a]/50"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="+230 5XXX XXXX"
                    className="w-full bg-transparent border border-white/15 text-white text-sm px-4 py-3 placeholder-white/20 focus:outline-none focus:border-[#c9962a]/50"
                  />
                </div>

                {/* Pass Type */}
                <div>
                  <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                    Pass Type
                  </label>
                  <select
                    value={singleType}
                    onChange={(e) => { setSingleType(e.target.value); setSingleTableNum(1); }}
                    className="w-full bg-[#0a0a0a] border border-white/15 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#c9962a]/50"
                  >
                    {currentTicketTypes.some((t) => t.area === ACCESS_SOLO_AREA) ? (
                      <optgroup label="Solo Entry">
                        {currentTicketTypes.filter((t) => t.area === ACCESS_SOLO_AREA).map((t) => (
                          <option key={t.id} value={t.id}>{t.label} · MUR {t.price.toLocaleString()}</option>
                        ))}
                        <option value="single_entry">Solo Entry (no option)</option>
                      </optgroup>
                    ) : (
                      <option value="single_entry">Solo Entry</option>
                    )}
                    {ACCESS_AREAS.map((area) => {
                      const areaTypes = currentTicketTypes.filter((t) => t.area === area);
                      if (areaTypes.length === 0) return null;
                      return (
                        <optgroup key={area} label={ACCESS_AREA_LABELS[area]}>
                          {areaTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  {currentTicketTypes.length === 0 && (
                    <p className="text-white/20 text-[9px] mt-1.5">
                      No table options set up for the current edition — add them under ACCESS Events → Tables.
                    </p>
                  )}
                </div>

                {/* Table / Section Number — tables only */}
                {needsTableNumber && (
                  <div>
                    <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                      {`Table Number (1–${singleMaxTable})`}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={singleMaxTable}
                      value={singleTableNum}
                      onChange={(e) => setSingleTableNum(Math.max(1, Math.min(singleMaxTable, parseInt(e.target.value) || 1)))}
                      className="w-full bg-transparent border border-white/15 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#c9962a]/50"
                    />
                    <p className="text-white/20 text-[9px] mt-1.5 uppercase tracking-[0.15em]">
                      Pass ID: {livePassId} (next free number, assigned on save)
                    </p>
                  </div>
                )}
                {!needsTableNumber && (
                  <p className="text-white/20 text-[9px] uppercase tracking-[0.15em]">
                    Pass ID will be: {livePassId} (assigned on save)
                  </p>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                    Notes (Internal Only)
                  </label>
                  <textarea
                    value={singleNotes}
                    onChange={(e) => setSingleNotes(e.target.value)}
                    placeholder="Walk-in, guest list, etc."
                    rows={2}
                    className="w-full bg-transparent border border-white/15 text-white text-sm px-4 py-3 placeholder-white/20 focus:outline-none focus:border-[#c9962a]/50 resize-none"
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                    Member Photo (Optional)
                  </label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <div className="flex items-center gap-4">
                    {singlePhoto ? (
                      <>
                        <img
                          src={singlePhoto}
                          alt="preview"
                          className="w-16 h-20 object-cover object-top border border-white/15"
                        />
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="photo-upload"
                            className="cursor-pointer border border-white/15 hover:border-white/40 text-white/50 hover:text-white text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors text-center"
                          >
                            Replace Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => { setSinglePhoto(""); if (photoInputRef.current) photoInputRef.current.value = ""; }}
                            className="border border-[#c72d28]/30 hover:border-[#c72d28] text-[#c72d28]/60 hover:text-[#c72d28] text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer flex items-center gap-2 border border-white/15 hover:border-[#c9962a]/50 text-white/40 hover:text-[#c9962a] text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-3 transition-colors w-full justify-center"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Photo
                      </label>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <button
                    onClick={handleSaveOnly}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 border border-white/20 hover:border-white/40 text-white/60 hover:text-white text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2.5 transition-colors disabled:opacity-40"
                  >
                    {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Save Only
                  </button>
                  <button
                    onClick={handleDownloadPass}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 border border-[#c9962a]/40 hover:border-[#c9962a] text-[#c9962a] text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2.5 transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3 h-3" />
                    Download Pass
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 text-black text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2.5 transition-colors disabled:opacity-40"
                    style={{ backgroundColor: isBusy ? "#888" : "#c9962a" }}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Send Pass via WhatsApp
                  </button>
                </div>
              </div>

              {/* ── Live preview (right) — FIX 5: natural 323×204 size, centered, mobile scale ── */}
              <div className="lg:col-span-7 lg:sticky lg:top-8">
                <p className="text-white/20 text-[9px] uppercase tracking-[0.25em] mb-5">
                  Live Pass Preview · Updates as you type
                </p>
                <div style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
                  <div style={{ flexShrink: 0, transformOrigin: "top center", transform: "scale(min(1, calc((100vw - 32px) / 323)))" }}>
                    <PassportCard pass={livePass} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Edition picker ── */}
          <div className="flex items-center gap-3 flex-wrap mb-8">
            <span className="text-[9px] text-white/30 uppercase tracking-[0.3em]">Showing</span>
            <select
              value={edition}
              onChange={(e) => { setEdition(e.target.value); setKindFilter("all"); }}
              className="bg-[#0a0a0a] border border-white/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#c9962a]/50"
            >
              <option value="current">
                {currentEvent ? `Current — ${currentEvent.name} · ${currentEvent.date}` : "Current — no upcoming edition"}
              </option>
              <option value="all">All time</option>
              {editions.map((e) => (
                <option key={e.id} value={e.id}>{e.name} · {e.date}</option>
              ))}
            </select>
            {edition === "current" && !currentEvent && (
              <span className="text-white/25 text-[10px]">
                Nothing upcoming — stats reset until the next edition is added. Pick "All time" or a past edition to look back.
              </span>
            )}
          </div>

          {/* ── Table options availability for the selected edition ── */}
          {selectedEventId && (
            <div className="mb-10">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <p className="text-[9px] text-white/25 uppercase tracking-[0.3em]">
                  Tables · {selectedEdition?.name ?? "Edition"}
                </p>
                <p className="text-[9px] text-white/25 uppercase tracking-[0.2em]">
                  Confirmed table revenue (shown filter): <span className="text-[#c9962a]">MUR {confirmedTableRevenue.toLocaleString()}</span>
                </p>
              </div>
              {editionTicketTypes.length === 0 ? (
                <p className="text-white/20 text-xs">No table options for this edition — set them up under ACCESS Events → Tables.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[ACCESS_SOLO_AREA, ...ACCESS_AREAS].map((area) => {
                    const areaTypes = editionTicketTypes.filter((t) => t.area === area);
                    if (areaTypes.length === 0) return null;
                    return (
                      <div key={area} className="bg-[#0a0a0a] border border-white/10 p-5">
                        <h3
                          className="text-white font-black leading-none mb-4"
                          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "24px" }}
                        >
                          {accessAreaLabel(area)}
                        </h3>
                        <div className="space-y-3">
                          {areaTypes.map((t) => {
                            const pct = t.capacity > 0 ? Math.round((t.used / t.capacity) * 100) : 0;
                            return (
                              <div key={t.id}>
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="text-white/70">{t.label}</span>
                                  <span className={t.available <= 0 ? "text-[#c72d28] font-bold" : "text-white/30"}>
                                    {t.available <= 0 ? "Full" : `${t.available} left`}
                                  </span>
                                </div>
                                <div className="h-1 bg-white/10 mb-1">
                                  <div
                                    className={`h-full ${pct >= 100 ? "bg-[#c72d28]" : pct >= 75 ? "bg-yellow-500" : "bg-[#c9962a]"}`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <p className="text-[9px] text-white/25">
                                  <span className="text-green-400">{t.confirmed} confirmed</span> · <span className="text-yellow-400">{t.pending} pending</span> · {t.capacity} total
                                  {t.manualUsed !== null && <span className="text-[#c9962a]"> · override {t.manualUsed}</span>}
                                  {" · "}MUR {t.price.toLocaleString()}{t.pricingMode === "per_person" ? "/person" : ""}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Solo Entry card — pricing & capacity, editable ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {TABLE_TYPES.map((key) => {
              const config = inventoryMap[key];
              if (!config) return null;
              const confirmed    = counts[key]?.confirmed ?? 0;
              const pendingCount = counts[key]?.pending ?? 0;
              const hasOverride  = config.manualUsed != null;
              const effectiveUsed = config.manualUsed ?? confirmed;
              const remaining    = config.capacity - effectiveUsed;
              const pct          = config.capacity > 0 ? Math.round((effectiveUsed / config.capacity) * 100) : 0;
              const isEditing    = editingType === key;

              return (
                <div key={key} className="bg-[#0a0a0a] border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 text-[#c9962a] text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-white/30 text-[9px] uppercase tracking-[0.15em] w-14 shrink-0">Total</span>
                          MUR
                          <input
                            type="number"
                            value={editValues.price}
                            onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                            className="w-20 bg-transparent border-b border-[#c9962a]/40 px-1 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white/30 text-[9px] uppercase tracking-[0.15em] w-14 shrink-0">Per person</span>
                          MUR
                          <input
                            type="number"
                            value={editValues.pricePerPerson}
                            onChange={(e) => setEditValues((v) => ({ ...v, pricePerPerson: e.target.value }))}
                            className="w-20 bg-transparent border-b border-[#c9962a]/40 px-1 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em]">
                        MUR {config.price.toLocaleString()} <span className="text-white/20 normal-case">&middot; MUR {config.pricePerPerson}/person</span>
                      </p>
                    )}
                    {isEditing ? (
                      <button
                        onClick={() =>
                          updateInventoryMutation.mutate({
                            tableType: key,
                            price: parseInt(editValues.price, 10) || config.price,
                            pricePerPerson: parseInt(editValues.pricePerPerson, 10) || config.pricePerPerson,
                            capacity: parseInt(editValues.capacity, 10) || config.capacity,
                            manualUsed: editValues.manualUsed.trim() === "" ? null : parseInt(editValues.manualUsed, 10),
                          })
                        }
                        disabled={updateInventoryMutation.isPending}
                        className="text-green-400 hover:text-green-300 disabled:opacity-40"
                        title="Save"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(config)}
                        className="text-white/20 hover:text-white/60"
                        title="Edit pricing & capacity"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h3
                    className="text-white font-black leading-none mb-4 mt-3"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "26px" }}
                  >
                    {config.label}
                  </h3>
                  <div className="h-1 bg-white/10 mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${pct >= 100 ? "bg-[#c72d28]" : pct >= 75 ? "bg-yellow-500" : "bg-[#c9962a]"}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-[9px] uppercase tracking-[0.2em]">{confirmed} confirmed</span>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${remaining <= 0 ? "text-[#c72d28]" : "text-white/30"}`}>
                        {remaining <= 0 ? "Full" : `${remaining} left`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-[9px] uppercase tracking-[0.2em]">{pendingCount} pending</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1 text-white/40 text-[9px]">
                          capacity
                          <input
                            type="number"
                            value={editValues.capacity}
                            onChange={(e) => setEditValues((v) => ({ ...v, capacity: e.target.value }))}
                            className="w-12 bg-transparent border-b border-white/20 px-1 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">{config.capacity} total</span>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#c9962a]/70 text-[9px] uppercase tracking-[0.2em]">Manual used override</span>
                        <input
                          type="number"
                          placeholder="auto"
                          value={editValues.manualUsed}
                          onChange={(e) => setEditValues((v) => ({ ...v, manualUsed: e.target.value }))}
                          className="w-14 bg-transparent border-b border-[#c9962a]/40 px-1 text-[#c9962a] text-[9px] focus:outline-none"
                        />
                      </div>
                    ) : hasOverride ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#c9962a] text-[9px] uppercase tracking-[0.2em]">Manual: {config.manualUsed} used</span>
                        <button
                          onClick={() => updateInventoryMutation.mutate({
                            tableType: key, price: config.price, pricePerPerson: config.pricePerPerson, capacity: config.capacity, manualUsed: null,
                          })}
                          className="text-white/30 hover:text-white text-[9px] uppercase tracking-[0.15em] underline"
                        >
                          Clear
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Summary row — clickable filters ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
              { key: "all" as const,             label: "All",             value: reservations.length, color: "text-white" },
              { key: "approved" as const,        label: "Confirmed",       value: approved.length,     color: "text-green-400" },
              { key: "pending_payment" as const, label: "Pending Payment", value: pending.length,       color: "text-yellow-400" },
              { key: "rejected" as const,        label: "Rejected",        value: rejected.length,      color: "text-[#c72d28]" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`text-left bg-[#0a0a0a] border p-5 transition-colors ${
                  statusFilter === s.key ? "border-[#c9962a]/60" : "border-white/10 hover:border-white/25"
                }`}
                data-testid={`access-filter-${s.key}`}
              >
                <p className={`font-black leading-none mb-1 ${s.color}`} style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "36px" }}>
                  {s.value}
                </p>
                <p className="text-white/25 text-[9px] uppercase tracking-[0.2em]">{s.label}</p>
              </button>
            ))}
          </div>

          {/* ── Area / ticket type filter ── */}
          <div className="mb-10 space-y-3">
            <div className="flex border border-white/15 w-fit flex-wrap" role="group" aria-label="Filter by area">
              {[
                { key: "all", label: "All" },
                { key: "solo", label: "Solo" },
                ...ACCESS_AREAS.map((a) => ({ key: `area:${a}`, label: ACCESS_AREA_LABELS[a] })),
              ].map((o) => {
                const active = o.key === kindFilter || (o.key === `area:${activeArea}` && kindFilter.startsWith("type:"));
                const count = editionReservations.filter((r) => matchesKind(r, o.key)).length;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setKindFilter(o.key)}
                    className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold transition-colors border-r border-white/15 last:border-r-0 ${
                      active ? "bg-[#c9962a] text-black" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {o.label} <span className={active ? "text-black/60" : "text-white/25"}>{count}</span>
                  </button>
                );
              })}
            </div>
            {activeArea && typesInEditionReservations(activeArea).length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {typesInEditionReservations(activeArea).map((t) => {
                  const key = `type:${t.id}`;
                  const active = kindFilter === key;
                  const count = editionReservations.filter((r) => r.ticketTypeId === t.id).length;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setKindFilter(active ? `area:${activeArea}` : key)}
                      className={`border px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] transition-colors ${
                        active ? "border-[#c9962a] text-[#c9962a]" : "border-white/15 text-white/40 hover:text-white"
                      }`}
                    >
                      {t.label}
                      {edition === "all" && editionById[t.eventId] ? ` · ${editionById[t.eventId].date}` : ""} <span className="text-white/25">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Reservations list ── */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <p className="text-[9px] text-white/25 uppercase tracking-[0.3em]">
                {reservationSearch.trim() || statusFilter !== "all"
                  ? `${visibleReservations.length} Reservation${visibleReservations.length !== 1 ? "s" : ""}`
                  : "All Reservations"}
              </p>
              {allReservations.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete ALL ${allReservations.length} ACCESS reservation(s) across every edition? This cannot be undone and does not affect table pricing/capacity settings.`)) {
                      clearReservationsMutation.mutate();
                    }
                  }}
                  disabled={clearReservationsMutation.isPending}
                  className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All Reservations
                </button>
              )}
            </div>

            {reservations.length > 0 && (
              <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  value={reservationSearch}
                  onChange={(e) => setReservationSearch(e.target.value)}
                  placeholder="Search by guest name, phone, pass ID, table..."
                  className="w-full bg-[#0a0a0a] border border-white/15 text-white placeholder:text-white/20 text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
            )}

            {visibleReservations.length === 0 ? (
              <p className="text-white/20 text-sm">
                {reservationSearch.trim() ? "No matching reservations." : `No reservations${statusFilter !== "all" ? " in this category" : ""} yet.`}
              </p>
            ) : (
              <div className="space-y-3">
                {visibleReservations.map((r) => {
                  const guests     = parseGuests(r.guestsJson);
                  const isPending  = r.status === "pending_payment";
                  const isApproved = r.status === "approved";
                  const isAdminIssued = r.source === "admin_single";

                  return (
                    <div
                      key={r.id}
                      className={[
                        "border p-5 transition-colors",
                        isPending  ? "border-yellow-400/20 bg-yellow-400/[0.03]"
                        : isApproved ? "border-green-400/20 bg-green-400/[0.03]"
                        : "border-white/5 opacity-50",
                      ].join(" ")}
                    >
                      {/* ── Row header ── */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className="text-white font-black leading-none"
                            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px" }}
                          >
                            {r.tableLabel}
                          </span>
                          <span className={[
                            "text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-0.5",
                            isPending  ? "bg-yellow-400/15 text-yellow-400"
                            : isApproved ? "bg-green-400/15 text-green-400"
                            : "bg-white/5 text-white/30",
                          ].join(" ")}>
                            {isPending ? "Pending Payment" : isApproved ? "Approved" : "Rejected"}
                          </span>
                          {isAdminIssued && (
                            <span className="text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 bg-[#c9962a]/15 text-[#c9962a]">
                              Admin Issued
                            </span>
                          )}
                          {edition === "all" && (
                            <span className="text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 border border-white/10 text-white/30">
                              {r.eventId && editionById[r.eventId] ? `${editionById[r.eventId].name} · ${editionById[r.eventId].date}` : "No edition"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Clock className="w-2.5 h-2.5 text-white/20" />
                          <span className="text-white/25 text-[9px] uppercase tracking-[0.15em]">{fmtDate(r.createdAt)}</span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete this pass? This cannot be undone.`)) {
                                deleteMutation.mutate(r.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="ml-1 flex items-center gap-1 border border-[#c72d28]/30 hover:border-[#c72d28] text-[#c72d28]/40 hover:text-[#c72d28] text-[8px] uppercase tracking-[0.15em] font-bold px-2 py-1 transition-colors disabled:opacity-30"
                            title="Delete this pass"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* ── Guest list ── */}
                      <div className="space-y-2 mb-4">
                        {guests.map((g, i) => (
                          <div key={i} className="flex items-center justify-between gap-4 flex-wrap">
                            {/* Guest info */}
                            <div className="flex items-center gap-3 min-w-0 text-[10px] font-mono">
                              <span className="text-white/20">{i + 1}.</span>
                              <span className="text-white/70">{g.name || "—"}</span>
                              {g.phone && <span className="text-white/25">{g.phone}</span>}
                              {guests.length > 1 && bookerOf(guests) === g && (
                                <span className="text-[8px] uppercase tracking-[0.2em] font-bold px-1.5 py-0.5 bg-white/10 text-white/50">Booker</span>
                              )}
                              {isApproved && g.passId && (
                                <span className="text-[#c9962a]/80 tracking-wider">{g.passId}</span>
                              )}
                            </div>

                            {/* Per-guest actions on approved rows */}
                            {isApproved && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => downloadGuestPass(g, r)}
                                  className="flex items-center gap-1 border border-white/15 hover:border-[#c9962a]/50 text-white/40 hover:text-[#c9962a] text-[8px] uppercase tracking-[0.15em] font-bold px-2.5 py-1.5 transition-colors"
                                  title={`Download pass for ${g.name}`}
                                >
                                  <Download className="w-2.5 h-2.5" />
                                  Download
                                </button>
                                <button
                                  onClick={() => sendGuestPass(g, r)}
                                  disabled={sendingId !== null}
                                  className="flex items-center gap-1 border border-[#c9962a]/30 hover:border-[#c9962a] text-[#c9962a]/60 hover:text-[#c9962a] text-[8px] uppercase tracking-[0.15em] font-bold px-2.5 py-1.5 transition-colors disabled:opacity-40"
                                  title={`Send ${g.name}'s pass to the booker via WhatsApp`}
                                >
                                  {sendingId === `${r.id}:${g.passId}` ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <MessageSquare className="w-2.5 h-2.5" />}
                                  Send
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ── Send every pass to the booker ── */}
                      {isApproved && guests.length > 1 && (
                        <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-white/5">
                          <button
                            onClick={() => sendAllToBooker(r)}
                            disabled={sendingId !== null}
                            className="flex items-center gap-1.5 text-black text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2 transition-colors disabled:opacity-40"
                            style={{ backgroundColor: "#c9962a" }}
                          >
                            {sendingId === `${r.id}:all` ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                            Send all {guests.length} passes to booker
                          </button>
                          <span className="text-white/25 text-[9px]">
                            {bookerOf(guests)?.phone?.trim() ? `${bookerOf(guests)!.name} · ${bookerOf(guests)!.phone}` : "No number on this booking — pick the chat in WhatsApp"}
                          </span>
                        </div>
                      )}

                      {/* ── Approve / reject actions on pending rows ── */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                          <button
                            onClick={() => approveMutation.mutate(r.id)}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-1.5 disabled:opacity-40 text-black text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2 transition-colors"
                            style={{ backgroundColor: "#c9962a" }}
                          >
                            <Check className="w-3 h-3" />
                            Confirm Payment &amp; Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(r.id)}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-1.5 border border-[#c72d28]/50 hover:border-[#c72d28] text-[#c72d28] text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
