import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, Eye, ExternalLink, Loader2, Search } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { TicketGenerator } from "@/components/ticket-generator";
import { buildTicketWaMessage } from "@/lib/ticket-messages";
import type { Event, Ticket as TicketType, TicketPurchase } from "@shared/schema";

const UPCOMING_SCOPE = "__upcoming__";
const ALL_SCOPE = "__all__";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [eventScope, setEventScope] = useState<string>(UPCOMING_SCOPE);

  const { data: purchases = [], isLoading } = useQuery<{ success: boolean; purchases: TicketPurchase[] }, Error, TicketPurchase[]>({
    queryKey: ["/api/admin/purchases"],
    select: (data) => data.purchases ?? [],
  });

  const { data: allEvents = [] } = useQuery<{ success: boolean; events: Event[] }, Error, Event[]>({
    queryKey: ["/api/events"],
    select: (data) => data.events ?? [],
  });
  const upcomingEvents = useMemo(() => allEvents.filter((e) => !e.isPast), [allEvents]);
  const pastEvents = useMemo(() => allEvents.filter((e) => e.isPast), [allEvents]);
  const eventNameById = useMemo(() => new Map(allEvents.map((e) => [e.id, e.name])), [allEvents]);

  // Scope orders to a specific event, every upcoming event, or everything —
  // defaults to upcoming so stats aren't diluted by long-settled past orders.
  const scopedPurchases = useMemo(() => {
    if (eventScope === ALL_SCOPE) return purchases;
    if (eventScope === UPCOMING_SCOPE) {
      const upcomingIds = new Set(upcomingEvents.map((e) => e.id));
      return purchases.filter((p) => p.eventId && upcomingIds.has(p.eventId));
    }
    return purchases.filter((p) => p.eventId === eventScope);
  }, [purchases, eventScope, upcomingEvents]);

  const { data: tickets = [] } = useQuery<{ success: boolean; tickets: TicketType[] }, Error, TicketType[]>({
    queryKey: ["/api/admin/tickets"],
    select: (data) => data.tickets ?? [],
  });

  const ticketsByPurchase = useMemo(() => {
    const map = new Map<string, TicketType[]>();
    for (const t of tickets) {
      if (!t.purchaseId) continue;
      map.set(t.purchaseId, [...(map.get(t.purchaseId) ?? []), t]);
    }
    return map;
  }, [tickets]);

  const [viewingTicket, setViewingTicket] = useState<TicketType | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/purchases/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({ title: "Purchase verified — ticket generated" });
    },
    onError: () => toast({ title: "Verification failed", variant: "destructive" }),
  });

  const deliverMutation = useMutation({
    mutationFn: (ticketId: string) => apiRequest("PATCH", `/api/admin/tickets/${ticketId}/deliver`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] }),
    onError: () => toast({ title: "Failed to mark delivered", variant: "destructive" }),
  });

  async function sendTicketWhatsApp(t: TicketType) {
    if (!t.customerPhone) {
      toast({ title: "No phone number on file for this ticket", variant: "destructive" });
      return;
    }
    let event: Event | undefined;
    if (t.eventId) {
      try {
        const data = await queryClient.fetchQuery<{ success: boolean; event: Event }>({ queryKey: ["/api/events", t.eventId] });
        event = data?.event;
      } catch {}
    }
    deliverMutation.mutate(t.id);
    window.open(`https://wa.me/${t.customerPhone.replace(/\D/g, "")}?text=${buildTicketWaMessage(t, event)}`, "_blank");
  }

  const filtered = scopedPurchases.filter((p) => {
    const matchesFilter = filter === "all" || p.status === filter;
    const s = search.toLowerCase();
    const matchesSearch = !s || p.customerName.toLowerCase().includes(s) || (p.customerPhone || "").includes(s) || (p.customerEmail || "").toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: scopedPurchases.length,
    pending: scopedPurchases.filter((p) => p.status === "pending").length,
    verified: scopedPurchases.filter((p) => p.status === "verified").length,
    rejected: scopedPurchases.filter((p) => p.status === "rejected").length,
  };

  return (
    <AdminLayout title="Orders">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(["all", "pending", "verified", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border p-4 text-left transition-colors ${filter === s ? "border-[#c72d28] bg-[#c72d28]/5" : "border-white/10 hover:border-white/20"}`}
          >
            <p className="text-white font-black text-2xl leading-none mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>{counts[s]}</p>
            <p className="text-white/30 text-[9px] uppercase tracking-[0.2em]">{s}</p>
          </button>
        ))}
      </div>

      {/* Search + event scope */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full bg-[#0a0a0a] border border-white/15 text-white placeholder:text-white/20 text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
        <select
          value={eventScope}
          onChange={(e) => setEventScope(e.target.value)}
          className="bg-[#0a0a0a] border border-white/15 text-white text-sm px-3 py-3 focus:outline-none focus:border-white/40 transition-colors sm:max-w-xs"
        >
          <option value={UPCOMING_SCOPE}>Upcoming Events</option>
          <option value={ALL_SCOPE}>All Events</option>
          {upcomingEvents.length > 0 && (
            <optgroup label="Upcoming">
              {upcomingEvents.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          )}
          {pastEvents.length > 0 && (
            <optgroup label="Past">
              {pastEvents.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/20 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-px">
          {filtered.map((p) => {
            const orderTickets = ticketsByPurchase.get(p.id) ?? [];
            return (
              <div key={p.id} className="bg-[#0a0a0a] border border-white/10 p-5 hover:border-white/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-white text-sm font-medium">{p.customerName}</p>
                      <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border shrink-0 ${
                        p.status === "verified" ? "border-green-500/30 text-green-400" :
                        p.status === "rejected" ? "border-red-500/30 text-red-400" :
                        "border-yellow-500/30 text-yellow-400"
                      }`}>{p.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-white/30 text-xs">
                      {p.eventId && eventNameById.get(p.eventId) && (
                        <span className="text-white/50">{eventNameById.get(p.eventId)}</span>
                      )}
                      <span>{p.ticketType}</span>
                      <span>{p.paymentMethod}</span>
                      <span>{p.quantity}x ticket{p.quantity !== 1 ? "s" : ""}</span>
                      {p.customerPhone && <span>{p.customerPhone}</span>}
                    </div>
                    {p.createdAt && (
                      <p className="text-white/20 text-[10px] mt-1">
                        {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.paymentProofUrl && (
                      <a
                        href={p.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 border border-white/15 text-white/40 hover:border-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Proof
                      </a>
                    )}
                    {p.status === "pending" && (
                      <button
                        onClick={() => verifyMutation.mutate(p.id)}
                        disabled={verifyMutation.isPending}
                        className="flex items-center gap-1.5 bg-green-700 text-white text-[9px] uppercase tracking-[0.15em] font-bold px-4 py-2 hover:bg-green-600 disabled:opacity-40 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                {orderTickets.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {orderTickets.map((t) => (
                      <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white/70 text-xs font-mono">{t.referenceCode}</p>
                          <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border ${t.isUsed ? "border-white/10 text-white/20" : "border-green-500/30 text-green-400"}`}>
                            {t.isUsed ? "Used" : "Valid"}
                          </span>
                          <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 border ${t.isDelivered ? "border-[#25D366]/30 text-[#25D366]" : "border-yellow-500/30 text-yellow-400"}`}>
                            {t.isDelivered ? "Sent" : "Not Sent"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setViewingTicket(t)}
                            className="flex items-center gap-1.5 border border-white/15 text-white/50 hover:border-white/40 hover:text-white text-[9px] uppercase tracking-[0.15em] px-3 py-2 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => sendTicketWhatsApp(t)}
                            disabled={deliverMutation.isPending}
                            title="Marks this ticket as sent and opens WhatsApp with a reminder message — the actual PDF is generated from View → Share Ticket"
                            className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] font-bold px-3 py-2 transition-colors disabled:opacity-40 ${
                              t.isDelivered
                                ? "border border-[#25D366]/40 text-[#25D366] hover:border-[#25D366]"
                                : "bg-[#25D366] text-black hover:bg-[#1ebe5b]"
                            }`}
                          >
                            <SiWhatsapp className="w-3 h-3" />
                            {t.isDelivered ? "Resend" : "Mark Sent"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/15 rounded-none">
          <DialogHeader>
            <DialogTitle className="text-white">Ticket — {viewingTicket?.referenceCode}</DialogTitle>
          </DialogHeader>
          {viewingTicket && <TicketGenerator ticket={viewingTicket} />}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
