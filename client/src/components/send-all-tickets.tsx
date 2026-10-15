import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { AftrTicketCard, ticketNodeToPdfBlob } from "@/components/ticket-generator";
import { shareFilesToWhatsApp, shareOutcomeToast } from "@/lib/shareFiles";
import type { Event, Ticket } from "@shared/schema";

/**
 * Every ticket from one order, rendered for review, with one button that
 * sends them all to the buyer — for when one person buys for their friends.
 */
export function SendAllTickets({
  tickets,
  buyerName,
  buyerPhone,
  onSent,
}: {
  tickets: Ticket[];
  buyerName: string;
  buyerPhone: string | null;
  /** Called after the PDFs were handed to WhatsApp (to mark them sent). */
  onSent: () => void;
}) {
  const { toast } = useToast();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [sending, setSending] = useState(false);

  const eventId = tickets[0]?.eventId;
  const { data: eventData, isLoading: eventLoading } = useQuery<{ success: boolean; event: Event }>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });
  const event = eventData?.event;
  const eventName = event?.name ?? "AFTR";

  async function sendAll() {
    setSending(true);
    try {
      const files: { blob: Blob; name: string }[] = [];
      for (let i = 0; i < tickets.length; i++) {
        const node = refs.current[i];
        if (!node) continue;
        files.push({ blob: await ticketNodeToPdfBlob(node), name: `AFTR-Ticket-${tickets[i].referenceCode}.pdf` });
      }
      const message =
        `Your ${eventName} tickets are ready!\n\n` +
        [event?.date, event?.venue].filter(Boolean).join(" · ") + (event?.date || event?.venue ? "\n" : "") +
        (event?.time ? `Time: ${event.time}\n` : "") +
        `\nTickets (${tickets.length}):\n` +
        tickets.map((t, i) => `${i + 1}. ${t.customerName} — ${t.ticketType} — ${t.referenceCode}`).join("\n") +
        `\n\nEach ticket has its own QR code and can only be scanned once — forward each person their own ticket.\n` +
        `See you on the dance floor!`;
      const outcome = await shareFilesToWhatsApp({
        files,
        title: `${eventName} Tickets - ${buyerName}`,
        phone: buyerPhone,
        message,
      });
      toast(shareOutcomeToast(outcome, files.length, "the buyer's"));
      if (outcome !== "cancelled") onSent();
    } catch (err) {
      console.error("Error sending tickets:", err);
      toast({ title: "Failed to generate tickets", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={sendAll}
          disabled={sending || eventLoading}
          className="flex items-center gap-2 bg-[#25D366] text-black text-[10px] uppercase tracking-[0.15em] font-bold px-5 py-3 hover:bg-[#1ebe5b] disabled:opacity-40 transition-colors"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SiWhatsapp className="w-3.5 h-3.5" />}
          Send all {tickets.length} tickets to buyer
        </button>
        <span className="text-white/30 text-xs">
          {buyerName}{buyerPhone ? ` · ${buyerPhone}` : " · no phone on this order"}
        </span>
      </div>
      <div className="space-y-6">
        {tickets.map((t, i) => (
          <AftrTicketCard key={t.id} ref={(el) => { refs.current[i] = el; }} ticket={t} event={event} />
        ))}
      </div>
    </div>
  );
}
