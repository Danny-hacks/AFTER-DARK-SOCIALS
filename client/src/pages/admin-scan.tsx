import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin-layout";
import { QRScanner } from "@/components/qr-scanner";
import type { Ticket } from "@shared/schema";

interface ScanLogEntry {
  ticket: Ticket;
  scannedAt: number;
  checkedIn: boolean;
  /** Was already checked in from an earlier scan, before this one */
  alreadyUsed: boolean;
}

export default function AdminScanPage() {
  const { toast } = useToast();
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);

  const useMutation2 = useMutation({
    mutationFn: (ticketId: string) => apiRequest("PATCH", `/api/admin/tickets/${ticketId}/use`),
    onSuccess: (_res, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setScanLog((prev) => prev.map((e) => (e.ticket.id === ticketId ? { ...e, checkedIn: true } : e)));
    },
    onError: (_err, ticketId) => {
      toast({ title: "Check-in failed for that scan — retry below", variant: "destructive" });
      setScanLog((prev) => prev.map((e) => (e.ticket.id === ticketId ? { ...e, checkedIn: false } : e)));
    },
  });

  function handleTicketFound(ticket: Ticket | null) {
    if (!ticket) {
      toast({ title: "Invalid ticket", variant: "destructive" });
      return;
    }
    if (ticket.isUsed) {
      setScanLog((prev) => [{ ticket, scannedAt: Date.now(), checkedIn: true, alreadyUsed: true }, ...prev].slice(0, 25));
      toast({ title: `Already checked in — ${ticket.customerName}`, description: ticket.referenceCode, variant: "destructive" });
      return;
    }
    setScanLog((prev) => [{ ticket, scannedAt: Date.now(), checkedIn: false, alreadyUsed: false }, ...prev].slice(0, 25));
    toast({ title: `Checked in — ${ticket.customerName}`, description: ticket.referenceCode });
    useMutation2.mutate(ticket.id);
  }

  return (
    <AdminLayout title="QR Scanner">
      <div className="max-w-lg space-y-6">
        <p className="text-white/30 text-xs">
          Scan any ticket's QR code — valid, unused tickets are checked in automatically. No need to open the specific event first.
        </p>

        <QRScanner onTicketFound={handleTicketFound} onClose={() => {}} />

        {scanLog.length > 0 && (
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mb-3">Recent Scans</p>
            <div className="space-y-px">
              {scanLog.map((entry) => (
                <div
                  key={`${entry.ticket.id}-${entry.scannedAt}`}
                  className="bg-[#0a0a0a] border border-white/10 p-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{entry.ticket.customerName}</p>
                    <p className="text-white/30 text-xs font-mono mt-0.5">{entry.ticket.referenceCode} · {entry.ticket.ticketType}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-white/20 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.scannedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {entry.alreadyUsed ? (
                      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] px-2 py-1 border border-yellow-500/30 text-yellow-400">
                        <CheckCircle className="w-3 h-3" />
                        Already Checked In
                      </span>
                    ) : entry.checkedIn ? (
                      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] px-2 py-1 border border-green-500/30 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Checked In
                      </span>
                    ) : (
                      <button
                        onClick={() => useMutation2.mutate(entry.ticket.id)}
                        disabled={useMutation2.isPending}
                        className="text-[9px] uppercase tracking-[0.15em] px-2 py-1 border border-yellow-500/30 text-yellow-400 hover:border-yellow-500/60 disabled:opacity-40 transition-colors"
                      >
                        Retry
                      </button>
                    )}
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
