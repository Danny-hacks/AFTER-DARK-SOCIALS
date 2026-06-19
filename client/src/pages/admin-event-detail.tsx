import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Loader2, CheckCircle, XCircle, QrCode, Users, Ticket,
  ShoppingBag, Edit2, Save,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { QRScanner } from "@/components/qr-scanner";
import type { Event, Ticket as TicketType, TicketPurchase } from "@shared/schema";

type Tab = "overview" | "tickets" | "orders" | "checkin" | "scan";

const editSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  time: z.string().optional(),
  venue: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isPast: z.boolean().default(false),
});
type EditData = z.infer<typeof editSchema>;

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("overview");
  const { toast } = useToast();

  const { data: event, isLoading } = useQuery<{ success: boolean; event: Event }, Error, Event>({
    queryKey: ["/api/events", id],
    select: (data) => data.event,
  });
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

  const eventPurchases = purchases.filter((p) => p.eventId === id);
  const eventTickets  = allTickets.filter((t)  => t.eventId  === id);

  const { register, handleSubmit, formState: { errors } } = useForm<EditData>({
    resolver: zodResolver(editSchema),
    values: event ? {
      name: event.name, date: event.date, time: event.time ?? "",
      venue: event.venue ?? "", description: event.description ?? "",
      imageUrl: event.imageUrl ?? "", isPast: event.isPast,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditData) => apiRequest("PATCH", `/api/admin/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
  });

  const inputCls = "w-full bg-transparent border border-white/15 text-white placeholder:text-white/25 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";
  const labelCls = "block text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2";

  const tabs: { key: Tab; label: string; icon: typeof Edit2 }[] = [
    { key: "overview", label: "Overview",  icon: Edit2 },
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
            <label className={labelCls}>Image URL</label>
            <input {...register("imageUrl")} placeholder="https://..." className={inputCls} />
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
          <p className="text-white/30 text-xs mb-6">{eventTickets.length} ticket{eventTickets.length !== 1 ? "s" : ""} issued</p>
          {eventTickets.length === 0 ? (
            <p className="text-white/20 text-sm">No tickets issued yet.</p>
          ) : (
            eventTickets.map((t) => (
              <div key={t.id} className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium font-mono">{t.referenceCode}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t.customerName} · {t.ticketType}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-[0.2em] px-2 py-1 border ${t.isUsed ? "border-white/10 text-white/20" : "border-green-500/30 text-green-400"}`}>
                  {t.isUsed ? "Used" : "Valid"}
                </span>
              </div>
            ))
          )}
        </div>
      )}

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
        <div className="max-w-lg">
          <QRScanner
            onTicketFound={(ticket) => {
              if (ticket) {
                toast({ title: `Valid — ${ticket.customerName}`, description: ticket.referenceCode });
              } else {
                toast({ title: "Invalid ticket", variant: "destructive" });
              }
            }}
            onClose={() => setTab("checkin")}
          />
        </div>
      )}
    </AdminLayout>
  );
}
