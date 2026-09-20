import { useState, useEffect, type FormEvent } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Event, EventTicketTier } from "@shared/schema";

// Dedicated ticket-line number — separate from the general After Dark
// Socials contact number used elsewhere for non-ticket enquiries.
const ADMIN_CONTACT = "+230 5515 1185";
const ADMIN_PHONE = "23055151185";

// ─── Countdown ───────────────────────────────────────────────────────────────
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs",  value: timeLeft.hours },
    { label: "Min",  value: timeLeft.minutes },
    { label: "Sec",  value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="border border-white/20 px-4 sm:px-6 py-4 sm:py-5 min-w-[60px] sm:min-w-[88px] text-center">
            <span
              className="text-3xl sm:text-5xl font-black text-white block leading-none"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
            >
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[9px] text-white/30 uppercase tracking-[0.25em] mt-2">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Order Form ───────────────────────────────────────────────────────────────
function OrderForm({ event, tiers }: { event: Event; tiers: EventTicketTier[] }) {
  const { toast } = useToast();
  const hasTiers = tiers.length > 0;
  const defaultTicketType = hasTiers ? tiers[0].name : "General";

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    ticketType: defaultTicketType, quantity: "1", paymentMethod: "MCB Juice",
  });
  // Names for tickets 2..N of a multi-ticket order — the purchaser's own
  // name above already covers ticket 1. Kept sized to quantity - 1.
  const [guestNames, setGuestNames] = useState<string[]>([]);

  const selectedTier = tiers.find((t) => t.name === form.ticketType);
  const quantity = Number(form.quantity) || 1;
  const total = selectedTier ? selectedTier.price * quantity : null;
  const extraGuestCount = Math.max(0, quantity - 1);

  function setQuantity(value: string) {
    setForm({ ...form, quantity: value });
    const count = Math.max(0, (Number(value) || 1) - 1);
    setGuestNames((prev) => {
      const next = prev.slice(0, count);
      while (next.length < count) next.push("");
      return next;
    });
  }

  function setGuestName(index: number, value: string) {
    setGuestNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const mutation = useMutation({
    mutationFn: (data: Omit<typeof form, "quantity"> & { quantity: number; eventId: string; guestNamesJson: string | null }) =>
      apiRequest("POST", "/api/tickets/purchase", data),
    onError: () => toast({ title: "Submission failed", variant: "destructive" }),
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    // Open the tab synchronously, right in the click handler — mobile
    // browsers (Safari especially) revoke "this came from a tap" permission
    // the moment we `await` anything, so a window.open() after the request
    // below gets silently blocked. Opening blank now and navigating it once
    // the request finishes keeps it tied to the original tap.
    const waWindow = window.open("", "_blank");

    const trimmedGuestNames = guestNames.map((n) => n.trim());
    const guestNamesJson = trimmedGuestNames.some(Boolean) ? JSON.stringify(trimmedGuestNames) : null;
    try {
      await mutation.mutateAsync({ ...form, quantity, eventId: event.id, guestNamesJson });
    } catch {
      waWindow?.close();
      return;
    }

    toast({ title: "Request submitted!", description: "We'll confirm your ticket via WhatsApp." });

    // Notify the admin on WhatsApp immediately with the full order — this is as
    // "automatic" as a browser can make it without a paid WhatsApp Business API:
    // it opens the chat pre-filled, no typing required on the admin's end.
    const otherGuests = trimmedGuestNames.filter(Boolean);
    const adminMessage =
      `New ticket request — ${event.name}\n\n` +
      `Name: ${form.customerName}\n` +
      `Phone: ${form.customerPhone}\n` +
      (form.customerEmail ? `Email: ${form.customerEmail}\n` : "") +
      `Ticket: ${form.ticketType} x${quantity}\n` +
      (otherGuests.length > 0 ? `Other guests: ${otherGuests.join(", ")}\n` : "") +
      (total !== null ? `Total: Rs ${total.toLocaleString()}\n` : "") +
      `Payment method: ${form.paymentMethod}`;
    const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(adminMessage)}`;
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      // The synchronous open was blocked too (e.g. a strict popup blocker) —
      // fall back to a normal window.open, which is the best we can do.
      window.open(waUrl, "_blank");
    }

    setForm({ customerName: "", customerEmail: "", customerPhone: "", ticketType: defaultTicketType, quantity: "1", paymentMethod: "MCB Juice" });
    setGuestNames([]);
  }

  const field = "w-full bg-black border-b border-white/15 text-white placeholder:text-white/20 text-sm px-0 py-3 focus:outline-none focus:border-white/50 transition-colors";
  const label = "block text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2";

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
        <div>
          <label htmlFor="order-name" className={label}>Full Name *</label>
          <input id="order-name" required type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Your full name" className={field} />
        </div>
        <div>
          <label htmlFor="order-phone" className={label}>WhatsApp / Phone *</label>
          <input id="order-phone" required type="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            placeholder="+230 5XXX XXXX" className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="order-email" className={label}>Email</label>
        <input id="order-email" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
          placeholder="your@email.com" className={field} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
        <div>
          <label htmlFor="order-ticket-type" className={label}>Ticket Type</label>
          {hasTiers ? (
            <select id="order-ticket-type" value={form.ticketType} onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
              className={`${field} cursor-pointer bg-black`}
              style={{ appearance: "none" }}
            >
              {tiers.map((t) => (
                <option key={t.id} value={t.name} style={{ background: "#0a0a0a" }}>
                  {t.name} — Rs {t.price.toLocaleString()}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-white/30 text-sm py-3">General — price TBC</p>
          )}
        </div>
        <div>
          <label htmlFor="order-quantity" className={label}>Quantity</label>
          <input id="order-quantity" type="number" min="1" max="10" value={form.quantity}
            onChange={(e) => setQuantity(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="order-payment-method" className={label}>Payment Method</label>
          <select id="order-payment-method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className={`${field} cursor-pointer bg-black`}
            style={{ appearance: "none" }}
          >
            {["MCB Juice", "Juice by Emtel", "MyT Money", "Bank Transfer", "Cash"].map((m) => (
              <option key={m} value={m} style={{ background: "#0a0a0a" }}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {extraGuestCount > 0 && (
        <div className="border-t border-white/10 pt-6">
          <p className={label}>Other Ticket Holders</p>
          <p className="text-white/20 text-xs mb-5">
            Each of your {quantity} tickets will be printed with its own name — add the other {extraGuestCount === 1 ? "person" : `${extraGuestCount} people`} you're booking for.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            {guestNames.map((name, i) => (
              <div key={i}>
                <label htmlFor={`guest-name-${i}`} className={label}>Guest {i + 2} Name</label>
                <input
                  id={`guest-name-${i}`}
                  type="text"
                  value={name}
                  onChange={(e) => setGuestName(i, e.target.value)}
                  placeholder="Full name"
                  className={field}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {total !== null && (
        <div className="flex items-baseline gap-3 border-t border-white/10 pt-6">
          <span className="text-white/30 text-[10px] uppercase tracking-[0.2em]">Total</span>
          <span className="text-[#c72d28] font-mono font-medium text-2xl">Rs {total.toLocaleString()}</span>
          {quantity > 1 && (
            <span className="text-white/20 text-xs">({quantity} × Rs {selectedTier!.price.toLocaleString()})</span>
          )}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="group inline-flex items-center gap-3 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#a82421] disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SiWhatsapp className="w-3.5 h-3.5" />}
          {mutation.isPending ? "Submitting..." : "Request Ticket"}
        </button>

        <div className="mt-5 border border-white/10 p-5 max-w-md">
          <p className="text-white/40 text-[9px] uppercase tracking-[0.25em] mb-3">What happens next</p>
          <ol className="space-y-2 text-white/40 text-xs leading-relaxed list-decimal list-inside">
            <li>Submit this form — no payment is taken here.</li>
            <li>We'll WhatsApp you at the number above with payment details for your selected method.</li>
            <li>Once payment is confirmed, your ticket is generated and sent to you on WhatsApp.</li>
          </ol>
          <p className="text-white/20 text-[10px] mt-3">
            Questions? Message us directly on{" "}
            <a
              href={`https://wa.me/${ADMIN_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline"
            >
              WhatsApp ({ADMIN_CONTACT})
            </a>.
          </p>
        </div>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery<{ success: boolean; event: Event; tiers: EventTicketTier[] }>({
    queryKey: ["/api/events", id],
  });
  const event = data?.event;
  const tiers = data?.tiers ?? [];

  usePageTitle(event?.name);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <p
          className="font-black text-white/20"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "64px" }}
        >
          EVENT NOT FOUND.
        </p>
        <Link href="/events" className="text-white/40 text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
          Back to Events
        </Link>
      </div>
    );
  }

  const eventDate = event.date ? new Date(event.date) : null;
  const isUpcoming = eventDate && eventDate > new Date() && !event.isPast;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      {event.videoUrl ? (
        <div className="relative h-[32vh] sm:h-[55vh] overflow-hidden">
          <video
            src={event.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={event.imageUrl ?? undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />
        </div>
      ) : event.imageUrl ? (
        <div className="relative h-[32vh] sm:h-[55vh] overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" />
        </div>
      ) : (
        <div className="h-32 sm:h-40" />
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-6 sm:pt-8 pb-16 sm:pb-24">
        {/* Back */}
        <Link href="/events" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors mb-10 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All Events
        </Link>

        {/* Title + meta */}
        <div className="mb-16 pb-16 border-b border-white/10">
          <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em] mb-4">
            {event.isPast ? "Past Event" : "Upcoming Event"}
          </p>
          <h1
            className="font-black text-white leading-none mb-6"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 8vw, 100px)" }}
          >
            {event.name}
          </h1>
          <div className="flex flex-wrap gap-6 mb-6">
            {event.date && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span>{event.date}</span>
              </div>
            )}
            {event.time && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.venue}</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-white/40 text-sm leading-relaxed max-w-2xl">{event.description}</p>
          )}
          {event.collaborators && (
            <p className="text-white/25 text-[10px] mt-4">In collaboration with {event.collaborators}</p>
          )}
        </div>

        {/* Countdown (upcoming only) */}
        {isUpcoming && eventDate && (
          <div className="mb-16 pb-16 border-b border-white/10">
            <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-8 text-center">Time Until Doors Open</p>
            <CountdownTimer targetDate={eventDate} />
          </div>
        )}

        {/* Order form or past message */}
        {isUpcoming ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 mb-10">
                <span className="w-8 h-px bg-[#c72d28]" />
                <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em]">Get Your Ticket</span>
              </div>
              <h2
                className="font-black text-white leading-none mb-4"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px, 5vw, 60px)" }}
              >
                SECURE YOUR SPOT.
              </h2>
              <p className="text-white/30 text-sm leading-relaxed">
                Fill out the form and we'll reach out via WhatsApp with payment details. Spots are limited — don't miss out.
              </p>
            </div>
            <div className="lg:col-span-7">
              <OrderForm event={event} tiers={tiers} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-white/10">
            <p
              className="font-black text-white/15 mb-4"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px, 5vw, 64px)" }}
            >
              THIS NIGHT HAS PASSED.
            </p>
            <p className="text-white/25 text-sm mb-8">Check out the gallery to relive the memories.</p>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-3 border border-white/15 text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 hover:border-white/40 hover:text-white transition-all"
            >
              View Gallery
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
