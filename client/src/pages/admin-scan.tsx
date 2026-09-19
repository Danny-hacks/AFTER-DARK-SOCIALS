import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { QRScanner } from "@/components/qr-scanner";
import type { Ticket } from "@shared/schema";

export default function AdminScanPage() {
  const { toast } = useToast();

  // Driven by the ticket's own usedAt timestamp (set server-side the moment
  // it's checked in) rather than an in-memory scan log — a client-only log
  // disappeared on every page refresh/navigation, which is exactly what
  // made this look like scans weren't being recorded at all.
  const { data: tickets = [] } = useQuery<{ success: boolean; tickets: Ticket[] }, Error, Ticket[]>({
    queryKey: ["/api/admin/tickets"],
    select: (data) => data.tickets ?? [],
  });

  const recentlyCheckedIn = useMemo(
    () =>
      tickets
        .filter((t) => t.isUsed && t.usedAt)
        .sort((a, b) => new Date(b.usedAt!).getTime() - new Date(a.usedAt!).getTime())
        .slice(0, 25),
    [tickets],
  );

  const checkInMutation = useMutation({
    mutationFn: (ticketId: string) => apiRequest("PATCH", `/api/admin/tickets/${ticketId}/use`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] }),
    onError: () => toast({ title: "Check-in failed — try scanning again", variant: "destructive" }),
  });

  function handleTicketFound(ticket: Ticket | null) {
    if (!ticket) {
      toast({ title: "Invalid ticket", variant: "destructive" });
      return;
    }
    if (ticket.isUsed) {
      toast({ title: `Already checked in — ${ticket.customerName}`, description: ticket.referenceCode, variant: "destructive" });
      return;
    }
    toast({ title: `Checked in — ${ticket.customerName}`, description: ticket.referenceCode });
    checkInMutation.mutate(ticket.id);
  }

  return (
    <AdminLayout title="QR Scanner">
      <div className="max-w-lg space-y-6">
        <p className="text-white/30 text-xs">
          Scan any ticket's QR code — valid, unused tickets are checked in automatically. No need to open the specific event first.
        </p>

        <QRScanner onTicketFound={handleTicketFound} onClose={() => {}} />

        {recentlyCheckedIn.length > 0 && (
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mb-3">Recently Checked In</p>
            <div className="space-y-px">
              {recentlyCheckedIn.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{ticket.customerName}</p>
                    <p className="text-white/30 text-xs font-mono mt-0.5">{ticket.referenceCode} · {ticket.ticketType}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-white/20 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.usedAt!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] px-2 py-1 border border-green-500/30 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Checked In
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
