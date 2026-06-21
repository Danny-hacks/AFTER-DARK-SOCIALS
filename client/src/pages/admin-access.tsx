import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Check, X, Clock, Send, MessageSquare } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Guest {
  name: string;
  phone?: string;
  passId: string;
}

interface Reservation {
  id: string;
  tableType: string;
  tableLabel: string;
  guestsJson: string;
  status: "pending_payment" | "approved" | "rejected";
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

const TABLE_CONFIG: Record<string, { label: string; price: number; capacity: number }> = {
  table_4:      { label: "Table for 4",           price: 4000, capacity: 5 },
  table_5:      { label: "Table for 5",           price: 5000, capacity: 5 },
  section_8_12: { label: "Section (8–12 guests)", price: 8000, capacity: 3 },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function parseGuests(json: string): Guest[] {
  try { return JSON.parse(json); } catch { return []; }
}

function buildWhatsappUrl(guest: Guest, tableLabel: string): string {
  const clean = (guest.phone ?? "").replace(/\s+/g, "").replace(/^\+/, "");
  const msg =
    `Your ACCESS pass has been confirmed.\n\n` +
    `Name: ${guest.name.toUpperCase()}\n` +
    `Table: ${tableLabel.toUpperCase()}\n` +
    `Date: 27 July 2026\n` +
    `Pass ID: ${guest.passId}\n` +
    `Venue: Mauritius\n\n` +
    `Present this pass at the door.\n` +
    `After Dark Socials · @afterdarksocials.mu`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

function sendPasses(r: Reservation) {
  const guests = parseGuests(r.guestsJson);
  let delay = 0;
  guests.forEach((g) => {
    if (!g.phone?.trim()) return;
    setTimeout(() => window.open(buildWhatsappUrl(g, r.tableLabel), "_blank"), delay);
    delay += 1000;
  });
}

export default function AdminAccessPage() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ReservationsResponse>({
    queryKey: ["/api/admin/access/reservations"],
    select: (d) => d,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/access/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      toast({ title: "Reservation approved", description: "Payment confirmed — use Send Passes to dispatch." });
    },
    onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PUT", `/api/admin/access/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access/reservations"] });
      toast({ title: "Reservation rejected" });
    },
    onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
  });

  const reservations = data?.reservations ?? [];
  const counts = data?.counts ?? {};

  const pending  = reservations.filter((r) => r.status === "pending_payment");
  const approved = reservations.filter((r) => r.status === "approved");
  const rejected = reservations.filter((r) => r.status === "rejected");

  return (
    <AdminLayout title="ACCESS">
      <div className="mb-8">
        <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
          Reservations · confirm payment to approve and issue passes
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Table inventory cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {Object.entries(TABLE_CONFIG).map(([key, config]) => {
              const confirmed    = counts[key]?.confirmed ?? 0;
              const pendingCount = counts[key]?.pending ?? 0;
              const remaining    = config.capacity - confirmed;
              const pct          = config.capacity > 0 ? Math.round((confirmed / config.capacity) * 100) : 0;

              return (
                <div key={key} className="bg-[#0a0a0a] border border-white/10 p-6">
                  <p className="text-[#c9962a] text-[9px] uppercase tracking-[0.3em] mb-1">
                    MUR {config.price.toLocaleString()}
                  </p>
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
                      <span className="text-green-400 text-[9px] uppercase tracking-[0.2em]">
                        {confirmed} confirmed
                      </span>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${remaining <= 0 ? "text-[#c72d28]" : "text-white/30"}`}>
                        {remaining <= 0 ? "Full" : `${remaining} left`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-[9px] uppercase tracking-[0.2em]">
                        {pendingCount} pending
                      </span>
                      <span className="text-white/20 text-[9px] uppercase tracking-[0.2em]">
                        {config.capacity} total
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Summary row ── */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { label: "Confirmed",       value: approved.length, color: "text-green-400" },
              { label: "Pending Payment", value: pending.length,  color: "text-yellow-400" },
              { label: "Rejected",        value: rejected.length, color: "text-[#c72d28]" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] border border-white/10 p-5">
                <p
                  className={`font-black leading-none mb-1 ${s.color}`}
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "36px" }}
                >
                  {s.value}
                </p>
                <p className="text-white/25 text-[9px] uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Reservation list ── */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-6">All Reservations</p>

            {reservations.length === 0 ? (
              <p className="text-white/20 text-sm">No reservations yet.</p>
            ) : (
              <div className="space-y-3">
                {[...pending, ...approved, ...rejected].map((r) => {
                  const guests    = parseGuests(r.guestsJson);
                  const isPending  = r.status === "pending_payment";
                  const isApproved = r.status === "approved";
                  const hasPhones  = guests.some((g) => g.phone?.trim());

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
                      <div className="flex items-start justify-between gap-4">
                        {/* ── Left: info ── */}
                        <div className="min-w-0 flex-1">
                          {/* Title + badge */}
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span
                              className="text-white font-black leading-none"
                              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px" }}
                            >
                              {r.tableLabel}
                            </span>
                            <span
                              className={[
                                "text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-0.5",
                                isPending  ? "bg-yellow-400/15 text-yellow-400"
                                : isApproved ? "bg-green-400/15 text-green-400"
                                : "bg-white/5 text-white/30",
                              ].join(" ")}
                            >
                              {isPending ? "Pending Payment" : isApproved ? "Approved" : "Rejected"}
                            </span>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-1 mb-3">
                            <Clock className="w-2.5 h-2.5 text-white/20" />
                            <span className="text-white/25 text-[9px] uppercase tracking-[0.15em]">
                              {fmtDate(r.createdAt)}
                            </span>
                          </div>

                          {/* Guest list */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                            {guests.map((g, i) => (
                              <div key={i} className="text-[10px] font-mono">
                                <span className="text-white/20 mr-1">{i + 1}.</span>
                                <span className="text-white/60">{g.name || "—"}</span>
                                {g.phone && (
                                  <span className="text-white/25 ml-1.5">{g.phone}</span>
                                )}
                                {isApproved && g.passId && (
                                  <span className="text-[#c9962a]/70 ml-2 tracking-wider">{g.passId}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Right: actions ── */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {isPending && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate(r.id)}
                                disabled={approveMutation.isPending}
                                className="flex items-center gap-1.5 disabled:opacity-40 text-black text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors"
                                style={{ backgroundColor: "#c9962a" }}
                              >
                                <Check className="w-3 h-3" />
                                Confirm Payment &amp; Approve
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(r.id)}
                                disabled={rejectMutation.isPending}
                                className="flex items-center gap-1.5 border border-[#c72d28]/50 hover:border-[#c72d28] text-[#c72d28] text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => {
                                if (!hasPhones) {
                                  toast({ title: "No phone numbers", description: "No guests provided a WhatsApp number." });
                                  return;
                                }
                                sendPasses(r);
                                toast({ title: "Opening WhatsApp", description: "Passes being sent to each guest." });
                              }}
                              className="flex items-center gap-1.5 border border-[#c9962a]/40 hover:border-[#c9962a] text-[#c9962a] text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-2 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Send Passes
                            </button>
                          )}
                        </div>
                      </div>
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
