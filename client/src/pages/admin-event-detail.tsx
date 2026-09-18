import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Loader2, CheckCircle, XCircle, QrCode, Users, Ticket,
  ShoppingBag, Edit2, Save, Image as ImageIcon, Video as VideoIcon,
  DollarSign, Plus, Trash2, Eye, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { QRScanner } from "@/components/qr-scanner";
import { ObjectUploader } from "@/components/ObjectUploader";
import { TicketGenerator } from "@/components/ticket-generator";
import type { Event, Ticket as TicketType, TicketPurchase, EventTicketTier } from "@shared/schema";

type Tab = "overview" | "pricing" | "tickets" | "orders" | "checkin" | "scan";

const editSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  time: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  volume: z.string().optional(),
  artistsInput: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isPast: z.boolean().default(false),
});
type EditData = z.infer<typeof editSchema>;

function parseArtists(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseGuestNames(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string" && n.trim()) : [];
  } catch {
    return [];
  }
}

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("overview");
  const { toast } = useToast();

  const { data: eventData, isLoading } = useQuery<{ success: boolean; event: Event; tiers: EventTicketTier[] }>({
    queryKey: ["/api/events", id],
  });
  const event = eventData?.event;
  const tiers = eventData?.tiers ?? [];
  const { data: purchases = [] } = useQuery<{ success: boolean; purchases: TicketPurchase[] }, Error, TicketPurchase[]>({
    queryKey: ["/api/admin/purchases"],
    select: (data) => data.purchases ?? [],
    enabled: tab === "orders" || tab === "checkin",
  });
  const { data: allTickets = [] } = useQuery<{ success: boolean; tickets: TicketType[] }, Error, TicketType[]>({
    queryKey: ["/api/admin/tickets"],
    select: (data) => data.tickets ?? [],
    enabled: tab === "tickets" || tab === "checkin",
  });

  const [newTierName, setNewTierName] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");

  const createTierMutation = useMutation({
    mutationFn: (data: { name: string; price: number; order: number }) =>
      apiRequest("POST", `/api/admin/events/${id}/tiers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      setNewTierName("");
      setNewTierPrice("");
      toast({ title: "Tier added" });
    },
    onError: () => toast({ title: "Failed to add tier", variant: "destructive" }),
  });

  const deleteTierMutation = useMutation({
    mutationFn: (tierId: string) => apiRequest("DELETE", `/api/admin/events/tiers/${tierId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      toast({ title: "Tier removed" });
    },
    onError: () => toast({ title: "Failed to remove tier", variant: "destructive" }),
  });

  const deliverMutation = useMutation({
    mutationFn: (ticketId: string) => apiRequest("PATCH", `/api/admin/tickets/${ticketId}/deliver`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] }),
    onError: () => toast({ title: "Failed to mark delivered", variant: "destructive" }),
  });

  const [viewingTicket, setViewingTicket] = useState<TicketType | null>(null);
  const [autoShareTicket, setAutoShareTicket] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<TicketType | null>(null);
  const [scanWasAlreadyUsed, setScanWasAlreadyUsed] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [manualTicket, setManualTicket] = useState({
    referenceCode: "", customerName: "", customerEmail: "", customerPhone: "",
    ticketType: "", paymentMethod: "MCB Juice",
  });

  const createTicketMutation = useMutation({
    mutationFn: (data: typeof manualTicket & { eventId: string; price: string; deliveryMethod: string }) =>
      apiRequest("POST", "/api/admin/tickets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setManualTicket({ referenceCode: "", customerName: "", customerEmail: "", customerPhone: "", ticketType: "", paymentMethod: "MCB Juice" });
      toast({ title: "Ticket created" });
    },
    onError: () => toast({ title: "Failed to create ticket", variant: "destructive" }),
  });

  function submitManualTicket() {
    if (!manualTicket.referenceCode.trim() || !manualTicket.customerName.trim() || !manualTicket.ticketType) {
      toast({ title: "Reference code, name, and ticket type are required", variant: "destructive" });
      return;
    }
    const matchedTier = tiers.find((t) => t.name === manualTicket.ticketType);
    createTicketMutation.mutate({
      ...manualTicket,
      eventId: id!,
      price: matchedTier ? `Rs ${matchedTier.price}` : "Rs 0",
      deliveryMethod: "whatsapp",
    });
  }

  function markTicketSent(t: TicketType) {
    deliverMutation.mutate(t.id);
  }

  const eventPurchases = purchases.filter((p) => p.eventId === id);
  const eventTickets = allTickets
    .filter((t) => t.eventId === id)
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditData>({
    resolver: zodResolver(editSchema),
    values: event ? {
      name: event.name, date: event.date, time: event.time ?? "",
      venue: event.venue ?? "", description: event.description ?? "",
      subtitle: event.subtitle ?? "", volume: event.volume ?? "",
      artistsInput: parseArtists(event.artists).join(", "),
      imageUrl: event.imageUrl ?? "", videoUrl: event.videoUrl ?? "",
      isPast: event.isPast,
    } : undefined,
  });

  const editImageUrl = watch("imageUrl");
  const editVideoUrl = watch("videoUrl");

  const updateMutation = useMutation({
    mutationFn: (data: EditData) => {
      const artists = (data.artistsInput ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const { artistsInput, ...rest } = data;
      return apiRequest("PATCH", `/api/admin/events/${id}`, {
        ...rest,
        artists: artists.length > 0 ? JSON.stringify(artists) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/past"] });
      toast({ title: "Event updated" });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const verifyMutation = useMutation({
    mutationFn: (pid: string) => apiRequest("POST", `/api/admin/purchases/${pid}/verify`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] }),
    onError: () => toast({ title: "Verification failed", variant: "destructive" }),
  });

  const useMutation2 = useMutation({
    mutationFn: (tid: string) => apiRequest("PATCH", `/api/admin/tickets/${tid}/use`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] }),
    onError: () => {
      toast({ title: "Check-in failed — tap Check In to retry", variant: "destructive" });
      setScannedTicket((prev) => (prev ? { ...prev, isUsed: false } : prev));
    },
  });

  const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";
  const labelCls = "block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2";

  const tabs: { key: Tab; label: string; icon: typeof Edit2 }[] = [
    { key: "overview", label: "Overview",  icon: Edit2 },
    { key: "pricing",  label: "Pricing",   icon: DollarSign },
    { key: "orders",   label: "Orders",    icon: ShoppingBag },
    { key: "tickets",  label: "Tickets",   icon: Ticket },
    { key: "checkin",  label: "Check-in",  icon: CheckCircle },
    { key: "scan",     label: "QR Scan",   icon: QrCode },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Event">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title="Event">
        <p className="text-white/30 text-sm">Event not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={event.name}>
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors mb-6 group">
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        All Events
      </Link>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-white/10 mb-8 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === key ? "text-white border-[#c72d28]" : "text-white/30 border-transparent hover:text-white/60"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview / Edit ── */}
      {tab === "overview" && (
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="max-w-2xl space-y-6">
          <div>
            <label className={labelCls}>Event Name *</label>
            <input {...register("name")} className={inputCls} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Date *</label>
              <input {...register("date")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input {...register("time")} placeholder="10PM — 4AM" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Venue</label>
            <input {...register("venue")} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea {...register("description")} rows={4} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Subtitle</label>
            <input {...register("subtitle")} placeholder="e.g. Full Capacity." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Volume Tag</label>
            <input {...register("volume")} placeholder="e.g. VOL. 4" className={inputCls} />
            <p className="text-white/20 text-[10px] mt-1.5">
              Links this event's gallery photos — must match a Volume used in Gallery uploads.
            </p>
          </div>
          <div>
            <label className={labelCls}>Lineup (comma-separated)</label>
            <input {...register("artistsInput")} placeholder="DJ Sweety, DJ Luvlesh" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cover Image</label>
            <div className="flex items-center gap-4">
              {editImageUrl && <img src={editImageUrl} alt="" className="w-16 h-16 object-cover border border-white/10" />}
              <ObjectUploader
                maxFileSize={20 * 1024 * 1024}
                allowedFileTypes={["image/*"]}
                onComplete={(url) => setValue("imageUrl", url)}
                buttonClassName="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                {editImageUrl ? "Replace Image" : "Upload Image"}
              </ObjectUploader>
              {editImageUrl && (
                <button
                  type="button"
                  onClick={() => setValue("imageUrl", "")}
                  className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={labelCls}>Event Video</label>
            <div className="flex items-center gap-4">
              {editVideoUrl && <span className="text-white/30 text-xs">Video attached</span>}
              <ObjectUploader
                maxFileSize={500 * 1024 * 1024}
                allowedFileTypes={["video/mp4"]}
                onComplete={(url) => setValue("videoUrl", url)}
                buttonClassName="gap-2"
              >
                <VideoIcon className="w-4 h-4" />
                {editVideoUrl ? "Replace Video" : "Upload Video"}
              </ObjectUploader>
              {editVideoUrl && (
                <button
                  type="button"
                  onClick={() => setValue("videoUrl", "")}
                  className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-white/20 text-[10px] mt-1.5">MP4 only — other formats often won't play in browsers. Remember to click Save Changes.</p>
          </div>
          <div className="flex items-center gap-3">
            <input {...register("isPast")} type="checkbox" id="isPast2" className="accent-[#c72d28] w-4 h-4" />
            <label htmlFor="isPast2" className="text-white/40 text-xs uppercase tracking-[0.15em] cursor-pointer">Mark as past event</label>
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#a82421] disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </form>
      )}

      {/* ── Pricing / Ticket Tiers ── */}
      {tab === "pricing" && (
        <div className="max-w-xl space-y-6">
          <p className="text-white/30 text-xs">
            Add as many ticket tiers as this event needs — Early Bird, Phase 1, Phase 2, VIP, etc.
            These appear as the ticket-type options on the public order form.
          </p>

          {tiers.length === 0 ? (
            <p className="text-white/20 text-sm">No tiers yet — add one below.</p>
          ) : (
            <div className="space-y-px">
              {tiers.map((t) => (
                <div key={t.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-[#c9962a] text-xs font-mono mt-0.5">Rs {t.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => deleteTierMutation.mutate(t.id)}
                    disabled={deleteTierMutation.isPending}
                    className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-red-500/50 hover:text-red-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border border-white/10 p-5">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">Add Tier</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
                placeholder="e.g. Early Bird"
                className={inputCls}
              />
              <input
                type="number"
                value={newTierPrice}
                onChange={(e) => setNewTierPrice(e.target.value)}
                placeholder="Price (Rs)"
                className={inputCls}
              />
              <button
                onClick={() => {
                  const price = parseInt(newTierPrice, 10);
                  if (!newTierName.trim() || isNaN(price)) {
                    toast({ title: "Enter a name and price", variant: "destructive" });
                    return;
                  }
                  createTierMutation.mutate({ name: newTierName.trim(), price, order: tiers.length });
                }}
                disabled={createTierMutation.isPending}
                className="flex items-center justify-center gap-2 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-3 hover:bg-[#a82421] disabled:opacity-50 transition-colors"
              >
                {createTierMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      {tab === "orders" && (
        <div className="space-y-3">
          <p className="text-white/30 text-xs mb-6">{eventPurchases.length} purchase request{eventPurchases.length !== 1 ? "s" : ""}</p>
          {eventPurchases.length === 0 ? (
            <p className="text-white/20 text-sm">No orders yet.</p>
          ) : (
            eventPurchases.map((p) => (
              <div key={p.id} className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{p.customerName}</p>
                  <p className="text-white/40 text-xs mt-0.5">{p.ticketType} · {p.paymentMethod} · {p.quantity}x</p>
                  <p className="text-white/25 text-xs">{p.customerPhone}</p>
                  {p.guestNamesJson && (
                    <p className="text-white/20 text-[10px] mt-0.5">Also for: {parseGuestNames(p.guestNamesJson).join(", ")}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 border ${
                    p.status === "verified" ? "border-green-500/30 text-green-400" :
                    p.status === "rejected" ? "border-red-500/30 text-red-400" :
                    "border-yellow-500/30 text-yellow-400"
                  }`}>{p.status}</span>
                  {p.status === "pending" && (
                    <button
                      onClick={() => verifyMutation.mutate(p.id)}
                      disabled={verifyMutation.isPending}
                      className="flex items-center gap-1.5 bg-green-700 text-white text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-2 hover:bg-green-600 disabled:opacity-40 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tickets ── */}
      {tab === "tickets" && (
        <div className="space-y-3">
          {/* Manual ticket creation — collapsible */}
          <div className="border border-white/10 mb-6">
            <button
              onClick={() => setShowCreateTicket((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="flex items-center gap-2 text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">
                <Plus className="w-3 h-3" />
                Create Ticket Manually
              </span>
              {showCreateTicket ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
            </button>
            {showCreateTicket && (
              <div className="border-t border-white/10 p-5">
                <p className="text-white/20 text-[10px] mb-5">
                  For walk-ins, manual sales, or anything outside the normal purchase flow.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    value={manualTicket.referenceCode}
                    onChange={(e) => setManualTicket({ ...manualTicket, referenceCode: e.target.value })}
                    placeholder="Reference Code *"
                    className={inputCls}
                  />
                  <input
                    value={manualTicket.customerName}
                    onChange={(e) => setManualTicket({ ...manualTicket, customerName: e.target.value })}
                    placeholder="Customer Name *"
                    className={inputCls}
                  />
                  <input
                    value={manualTicket.customerEmail}
                    onChange={(e) => setManualTicket({ ...manualTicket, customerEmail: e.target.value })}
                    placeholder="Email (optional)"
                    className={inputCls}
                  />
                  <input
                    value={manualTicket.customerPhone}
                    onChange={(e) => setManualTicket({ ...manualTicket, customerPhone: e.target.value })}
                    placeholder="WhatsApp / Phone (optional)"
                    className={inputCls}
                  />
                  <select
                    value={manualTicket.ticketType}
                    onChange={(e) => setManualTicket({ ...manualTicket, ticketType: e.target.value })}
                    className={`${inputCls} bg-black cursor-pointer`}
                  >
                    <option value="">Select ticket type *</option>
                    {tiers.map((t) => (
                      <option key={t.id} value={t.name}>{t.name} — Rs {t.price.toLocaleString()}</option>
                    ))}
                  </select>
                  <select
                    value={manualTicket.paymentMethod}
                    onChange={(e) => setManualTicket({ ...manualTicket, paymentMethod: e.target.value })}
                    className={`${inputCls} bg-black cursor-pointer`}
                  >
                    {["MCB Juice", "Juice by Emtel", "MyT Money", "Bank Transfer", "Cash"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                {tiers.length === 0 && (
                  <p className="text-yellow-400/70 text-[10px] mb-4">
                    No ticket tiers configured for this event yet — add one under the Pricing tab first.
                  </p>
                )}
                <button
                  onClick={submitManualTicket}
                  disabled={createTicketMutation.isPending}
                  className="flex items-center gap-2 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 hover:bg-[#a82421] disabled:opacity-50 transition-colors"
                >
                  {createTicketMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Create Ticket
                </button>
              </div>
            )}
          </div>

          <p className="text-white/30 text-xs mb-1">{eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""} issued</p>
          <p className="text-white/15 text-[10px] mb-6">
            View/Share Ticket opens the ticket preview to send it the first time. Mark Sent just tracks delivery status — once sent, Resend fires the WhatsApp share again directly.
          </p>
          {eventTickets.length === 0 ? (
            <p className="text-white/20 text-sm">No tickets issued yet.</p>
          ) : (
            eventTickets.map((t) => (
              <div key={t.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-white text-sm font-medium font-mono">{t.referenceCode}</p>
                    <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${t.isUsed ? "border-white/10 text-white/20" : "border-green-500/30 text-green-400"}`}>
                      {t.isUsed ? "Used" : "Valid"}
                    </span>
                    <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${t.isDelivered ? "border-[#25D366]/30 text-[#25D366]" : "border-yellow-500/30 text-yellow-400"}`}>
                      {t.isDelivered ? "Sent" : "Not Sent"}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{t.customerName} · {t.ticketType} · {t.price}</p>
                  {t.customerPhone && <p className="text-white/25 text-xs">{t.customerPhone}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setViewingTicket(t); setAutoShareTicket(false); }}
                    className="flex items-center gap-1.5 border border-white/15 text-white/50 hover:border-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    View/Share Ticket
                  </button>
                  {t.isDelivered ? (
                    <button
                      onClick={() => { setViewingTicket(t); setAutoShareTicket(true); }}
                      title="Sends the ticket again via WhatsApp, same as Share Ticket inside the preview"
                      className="flex items-center gap-1.5 border border-[#25D366]/40 text-[#25D366] hover:border-[#25D366] text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-2 transition-colors"
                    >
                      <SiWhatsapp className="w-3 h-3" />
                      Resend
                    </button>
                  ) : (
                    <button
                      onClick={() => markTicketSent(t)}
                      disabled={deliverMutation.isPending}
                      title="Marks this ticket as sent — send the actual PDF first via View/Share Ticket"
                      className="flex items-center gap-1.5 bg-[#25D366] text-black text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-2 hover:bg-[#1ebe5b] disabled:opacity-40 transition-colors"
                    >
                      <SiWhatsapp className="w-3 h-3" />
                      Mark Sent
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Ticket view dialog ── */}
      <Dialog open={!!viewingTicket} onOpenChange={(open) => { if (!open) { setViewingTicket(null); setAutoShareTicket(false); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/15 rounded-none">
          <DialogHeader>
            <DialogTitle className="text-white">Ticket — {viewingTicket?.referenceCode}</DialogTitle>
          </DialogHeader>
          {viewingTicket && <TicketGenerator ticket={viewingTicket} autoShare={autoShareTicket} />}
        </DialogContent>
      </Dialog>

      {/* ── Check-in ── */}
      {tab === "checkin" && (
        <div className="space-y-3">
          <p className="text-white/30 text-xs mb-6">Guest check-in — {eventTickets.filter((t) => t.isUsed).length}/{eventTickets.length} checked in</p>
          {eventTickets.length === 0 ? (
            <p className="text-white/20 text-sm">No tickets to check in.</p>
          ) : (
            eventTickets.map((t) => (
              <div key={t.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{t.customerName}</p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">{t.referenceCode}</p>
                </div>
                <div className="flex items-center gap-3">
                  {t.isUsed ? (
                    <span className="flex items-center gap-1.5 text-green-400 text-[9px] uppercase tracking-[0.2em]">
                      <CheckCircle className="w-3 h-3" /> Checked In
                    </span>
                  ) : (
                    <button
                      onClick={() => useMutation2.mutate(t.id)}
                      className="flex items-center gap-1.5 border border-white/15 text-white/50 hover:border-green-500/40 hover:text-green-400 text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                    >
                      <Users className="w-3 h-3" />
                      Check In
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── QR Scanner ── */}
      {tab === "scan" && (
        <div className="max-w-lg space-y-6">
          <QRScanner
            onTicketFound={(ticket) => {
              if (!ticket) {
                toast({ title: "Invalid ticket", variant: "destructive" });
                return;
              }
              if (ticket.isUsed) {
                setScannedTicket(ticket);
                setScanWasAlreadyUsed(true);
                toast({ title: `Already checked in — ${ticket.customerName}`, description: ticket.referenceCode, variant: "destructive" });
                return;
              }
              // Check in immediately on a valid scan — no extra click needed.
              setScannedTicket({ ...ticket, isUsed: true });
              setScanWasAlreadyUsed(false);
              toast({ title: `Checked in — ${ticket.customerName}`, description: ticket.referenceCode });
              useMutation2.mutate(ticket.id);
            }}
            onClose={() => setTab("checkin")}
          />

          {scannedTicket && (
            <div className="border border-white/10 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm font-medium">{scannedTicket.customerName}</p>
                <p className="text-white/30 text-xs font-mono mt-0.5">{scannedTicket.referenceCode}</p>
                <span className={`inline-block mt-2 text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 border ${
                  scanWasAlreadyUsed ? "border-yellow-500/30 text-yellow-400" : scannedTicket.isUsed ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"
                }`}>
                  {scanWasAlreadyUsed ? "Already Checked In" : scannedTicket.isUsed ? "Checked In" : "Pending"}
                </span>
              </div>
              {!scannedTicket.isUsed && (
                <button
                  onClick={() => {
                    useMutation2.mutate(scannedTicket.id);
                    setScannedTicket({ ...scannedTicket, isUsed: true });
                  }}
                  disabled={useMutation2.isPending}
                  className="flex items-center gap-1.5 bg-green-700 text-white text-[9px] uppercase tracking-[0.15em] font-bold px-4 py-2.5 hover:bg-green-600 disabled:opacity-40 transition-colors shrink-0"
                >
                  {useMutation2.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Check In
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
