import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Check, X, Clock, ChevronDown, ChevronUp, Download, MessageSquare, Plus, Trash2, Pencil, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PassportCard, type PassFields } from "@/components/passport-card";
import { generatePassPDF } from "@/lib/generatePassCanvas";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AccessTableInventory } from "@shared/schema";

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

function buildWaUrl(guest: Guest, tableLabel: string): string {
  const clean = (guest.phone ?? "").replace(/[\s\-\+\(\)]/g, "");
  const msg =
    `Your ACCESS pass is confirmed.\n\n` +
    `Name: ${guest.name.toUpperCase()}\n` +
    `Table: ${tableLabel.toUpperCase()}\n` +
    `Date: 3 July 2026\n` +
    `Pass ID: ${guest.passId}\n\n` +
    `Your pass has been attached to this message.\n\n` +
    `After Dark Socials · @afterdarksocials.mu`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminAccessPage() {
  const { toast } = useToast();

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
  const inventoryMap: Record<string, AccessTableInventory> = {};
  for (const row of inventory) inventoryMap[row.tableType] = row;
  const TABLE_TYPES = ["single_entry", "table_4", "table_5", "section_8_12"];

  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: string; capacity: string }>({ price: "", capacity: "" });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ tableType, price, capacity }: { tableType: string; price: number; capacity: number }) =>
      apiRequest("PATCH", `/api/admin/access/inventory/${tableType}`, { price, pricePerPerson: price, capacity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access/capacity"] });
      toast({ title: "Pricing updated" });
      setEditingType(null);
    },
    onError: () => toast({ title: "Failed to update pricing", variant: "destructive" }),
  });

  function startEditing(row: AccessTableInventory) {
    setEditingType(row.tableType);
    setEditValues({ price: String(row.price), capacity: String(row.capacity) });
  }

  // ── Approve / reject mutations ──
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/access/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      toast({ title: "Reservation approved", description: "Payment confirmed — use Send Passes to dispatch." });
    },
    onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/access/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      toast({ title: "Pass deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/access/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      toast({ title: "Reservation rejected" });
    },
    onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
  });

  // ── Single pass form ──
  const [showIssueForm, setShowIssueForm]     = useState(false);
  const [singleName, setSingleName]           = useState("");
  const [singlePhone, setSinglePhone]         = useState("");
  const [singleType, setSingleType]           = useState("table_4");
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

  const computedTableLabel =
    singleType === "section_8_12" ? `Section ${singleTableNum}` :
    inventoryMap[singleType]?.label ?? "";

  const livePassId =
    singleType === "single_entry" ? "ACC-SE???" :
    singleType === "section_8_12" ? `ACC-S${singleTableNum}001` :
    `ACC-${singleTableNum}001`;

  const livePass: PassFields = {
    name: singleName,
    tableLabel: computedTableLabel,
    photo: singlePhoto,
    id: livePassId,
  };

  const singleMutation = useMutation({
    mutationFn: (body: object) => apiRequest("POST", "/api/admin/access/single", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
    },
    onError: () => toast({ title: "Failed to create pass", variant: "destructive" }),
  });

  function resetSingleForm() {
    setSingleName(""); setSinglePhone(""); setSingleType("table_4");
    setSingleTableNum(1); setSingleNotes(""); setSinglePhoto("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  // Single pass actions
  async function handleSaveOnly() {
    if (!singleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    await singleMutation.mutateAsync({ name: singleName, phone: singlePhone, tableType: singleType, tableNumber: singleTableNum, notes: singleNotes });
    resetSingleForm();
    toast({ title: "Pass saved", description: `Pass ID: ${livePassId}` });
  }

  async function handleDownloadPass() {
    if (!singleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const raw = await singleMutation.mutateAsync({ name: singleName, phone: singlePhone, tableType: singleType, tableNumber: singleTableNum, notes: singleNotes });
    const res = await (raw as Response).json();
    const passId: string = res.passId;
    const tableLabel: string = res.tableLabel ?? computedTableLabel;
    console.log("[handleDownloadPass] passId:", passId, "tableLabel:", tableLabel);
    await generatePassPDF({ name: singleName, table: tableLabel, date: "3 July 2026", passId, photoUrl: singlePhoto || undefined });
    resetSingleForm();
    toast({ title: "Pass saved & downloaded", description: `ACCESS-PASS-${passId}.pdf` });
  }

  async function handleSendWhatsApp() {
    if (!singleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const raw = await singleMutation.mutateAsync({ name: singleName, phone: singlePhone, tableType: singleType, tableNumber: singleTableNum, notes: singleNotes });
    const res = await (raw as Response).json();
    const passId: string = res.passId;
    const tableLabel: string = res.tableLabel ?? computedTableLabel;
    console.log("[handleSendWhatsApp] passId:", passId, "tableLabel:", tableLabel);
    await generatePassPDF({ name: singleName, table: tableLabel, date: "3 July 2026", passId, photoUrl: singlePhoto || undefined });
    if (res.whatsappUrl) window.open(res.whatsappUrl, "_blank");
    resetSingleForm();
    toast({ title: "Pass sent", description: singlePhone ? "PDF downloaded · WhatsApp opened" : "PDF downloaded (no phone provided)" });
  }

  // Per-guest download / send
  async function downloadGuestPass(guest: Guest, tableLabel: string) {
    await generatePassPDF({ name: guest.name, table: tableLabel, date: "3 July 2026", passId: guest.passId, photoUrl: undefined });
    toast({ title: "Downloading…", description: `ACCESS-PASS-${guest.passId}.pdf` });
  }

  function sendGuestWhatsApp(guest: Guest, tableLabel: string) {
    downloadGuestPass(guest, tableLabel);
    setTimeout(() => window.open(buildWaUrl(guest, tableLabel), "_blank"), 400);
  }

  const reservations = data?.reservations ?? [];
  const counts       = data?.counts ?? {};
  const pending  = reservations.filter((r) => r.status === "pending_payment");
  const approved = reservations.filter((r) => r.status === "approved");
  const rejected = reservations.filter((r) => r.status === "rejected");

  const [statusFilter, setStatusFilter] = useState<"all" | "pending_payment" | "approved" | "rejected">("all");
  const visibleReservations =
    statusFilter === "all" ? [...pending, ...approved, ...rejected] : reservations.filter((r) => r.status === statusFilter);

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
                    <option value="single_entry">Single Entry</option>
                    <option value="table_4">Table for 4</option>
                    <option value="table_5">Table for 5</option>
                    <option value="section_8_12">Section (8–12 guests)</option>
                  </select>
                </div>

                {/* Table / Section Number — hidden for single_entry */}
                {singleType !== "single_entry" && (
                  <div>
                    <label className="block text-[9px] text-[#c9962a]/60 uppercase tracking-[0.3em] mb-2">
                      {singleType === "section_8_12"
                        ? `Section Number (1–${inventoryMap[singleType]?.capacity ?? 1})`
                        : `Table Number (1–${inventoryMap[singleType]?.capacity ?? 1})`}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={inventoryMap[singleType]?.capacity ?? 1}
                      value={singleTableNum}
                      onChange={(e) => setSingleTableNum(Math.max(1, Math.min(inventoryMap[singleType]?.capacity ?? 1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-transparent border border-white/15 text-white text-sm px-4 py-3 focus:outline-none focus:border-[#c9962a]/50"
                    />
                    <p className="text-white/20 text-[9px] mt-1.5 uppercase tracking-[0.15em]">
                      Pass ID will be: {livePassId}
                    </p>
                  </div>
                )}
                {singleType === "single_entry" && (
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
          {/* ── Table inventory cards — pricing & capacity, editable ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {TABLE_TYPES.map((key) => {
              const config = inventoryMap[key];
              if (!config) return null;
              const confirmed    = counts[key]?.confirmed ?? 0;
              const pendingCount = counts[key]?.pending ?? 0;
              const remaining    = config.capacity - confirmed;
              const pct          = config.capacity > 0 ? Math.round((confirmed / config.capacity) * 100) : 0;
              const isEditing    = editingType === key;

              return (
                <div key={key} className="bg-[#0a0a0a] border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1 text-[#c9962a] text-[11px]">
                        MUR
                        <input
                          type="number"
                          value={editValues.price}
                          onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                          className="w-20 bg-transparent border-b border-[#c9962a]/40 px-1 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em]">
                        MUR {config.price.toLocaleString()}
                      </p>
                    )}
                    {isEditing ? (
                      <button
                        onClick={() =>
                          updateInventoryMutation.mutate({
                            tableType: key,
                            price: parseInt(editValues.price, 10) || config.price,
                            capacity: parseInt(editValues.capacity, 10) || config.capacity,
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
                    className="text-white font-black leading-none mb-4"
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

          {/* ── Reservations list ── */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-6">
              {statusFilter === "all" ? "All Reservations" : `${visibleReservations.length} Reservation${visibleReservations.length !== 1 ? "s" : ""}`}
            </p>

            {visibleReservations.length === 0 ? (
              <p className="text-white/20 text-sm">No reservations{statusFilter !== "all" ? " in this category" : ""} yet.</p>
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
                              {isApproved && g.passId && (
                                <span className="text-[#c9962a]/80 tracking-wider">{g.passId}</span>
                              )}
                            </div>

                            {/* Per-guest actions on approved rows */}
                            {isApproved && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => downloadGuestPass(g, r.tableLabel)}
                                  className="flex items-center gap-1 border border-white/15 hover:border-[#c9962a]/50 text-white/40 hover:text-[#c9962a] text-[8px] uppercase tracking-[0.15em] font-bold px-2.5 py-1.5 transition-colors"
                                  title={`Download pass for ${g.name}`}
                                >
                                  <Download className="w-2.5 h-2.5" />
                                  Download
                                </button>
                                {g.phone?.trim() && (
                                  <button
                                    onClick={() => sendGuestWhatsApp(g, r.tableLabel)}
                                    className="flex items-center gap-1 border border-[#c9962a]/30 hover:border-[#c9962a] text-[#c9962a]/60 hover:text-[#c9962a] text-[8px] uppercase tracking-[0.15em] font-bold px-2.5 py-1.5 transition-colors"
                                    title={`Send pass to ${g.name} via WhatsApp`}
                                  >
                                    <MessageSquare className="w-2.5 h-2.5" />
                                    Send
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

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
