import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowUpRight, Images } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { usePageTitle } from "@/hooks/use-page-title";
import { Reveal } from "@/components/reveal";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { AccessEvent, Event } from "@shared/schema";

const ACCESS_DEFAULT_BANNER = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures/Serge_59.jpg";

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.slug ?? event.id}`} className="group block border border-white/10 hover:border-white/25 transition-all duration-300">
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
        </div>
      )}
      <div className="p-6 sm:p-8">
        <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em] mb-3">Upcoming</p>
        <h2
          className="text-white leading-none mb-4 group-hover:text-white/80 transition-colors"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          {event.name}
        </h2>
        <div className="flex flex-wrap gap-4 mb-5">
          {event.date && (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{event.date}</span>
            </div>
          )}
          {event.time && (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Clock className="w-3 h-3" />
              <span>{event.time}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{event.venue}</span>
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-white/30 text-sm leading-relaxed mb-6 line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center gap-2 text-white/40 group-hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-colors">
          Get Tickets
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

// Past events don't need their own description/ticket page as the primary
// CTA — that goes straight into the Gallery, pre-filtered to the event's
// volume — but the event's own page still exists and has real content, so
// a secondary link keeps it reachable for search engines (and anyone who
// wants the full lineup/description) instead of leaving it orphaned.
function PastEventCard({ event }: { event: Event }) {
  const galleryHref = event.volume ? `/gallery?vol=${encodeURIComponent(event.volume)}` : "/gallery";
  const detailHref = `/events/${event.slug ?? event.id}`;
  return (
    <div className="group border border-white/10 hover:border-white/25 transition-all duration-300">
      <Link href={galleryHref} className="block">
        {event.imageUrl && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
          </div>
        )}
      </Link>
      <div className="p-6">
        <p className="text-white/25 text-[9px] uppercase tracking-[0.35em] mb-2">Past · {event.date}</p>
        <h2
          className="text-white leading-none mb-4 group-hover:text-white/80 transition-colors"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(24px, 3.5vw, 36px)" }}
        >
          {event.name}
        </h2>
        <div className="flex items-center justify-between gap-3">
          <Link
            href={galleryHref}
            className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-colors"
          >
            <Images className="w-3.5 h-3.5" />
            View Gallery
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href={detailHref}
            className="text-white/20 hover:text-white/60 text-[10px] uppercase tracking-[0.2em] transition-colors"
          >
            Event Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// A standing entry for ACCESS alongside past AFTR events — it isn't tied to
// one specific edition, so it always links to the ACCESS page itself.
function AccessCard({ accessEvent }: { accessEvent: AccessEvent | null | undefined }) {
  const bannerUrl = accessEvent?.bannerUrl || ACCESS_DEFAULT_BANNER;
  return (
    <Link href="/access" className="group block border border-white/10 hover:border-[#c9962a]/40 transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img
          src={bannerUrl}
          alt="ACCESS"
          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
      </div>
      <div className="p-6">
        <p className="text-[9px] uppercase tracking-[0.35em] mb-2" style={{ color: "#c9962a" }}>Private Social</p>
        <h2
          className="text-white leading-none mb-4 group-hover:text-white/80 transition-colors"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(24px, 3.5vw, 36px)" }}
        >
          ACCESS
        </h2>
        <div className="flex items-center gap-2 text-white/40 group-hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-colors">
          View ACCESS
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  usePageTitle("Events");
  const { data: events = [], isLoading } = useQuery<{ success: boolean; events: Event[] }, Error, Event[]>({
    queryKey: ["/api/events"],
    select: (data) => data.events ?? [],
  });
  const { data: accessData } = useQuery<{ success: boolean; event: AccessEvent | null }>({
    queryKey: ["/api/access/current"],
  });

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-20 sm:pb-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-14">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Events</span>
        </div>

        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end border-b border-white/10 pb-16 mb-16">
          <h1
            className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(52px, 8vw, 100px)" }}
          >
            GET YOUR
            <br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
              TICKETS.
            </span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Every AFTR night is a new chapter. Secure your spot before it sells out.
          </p>
        </Reveal>

        {/* Event grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black h-64 animate-pulse" />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {upcoming.map((event, idx) => (
              <Reveal key={event.id} className="bg-black" delay={(idx % 3) * 0.08}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="border border-white/10 py-20 sm:py-28 px-8 flex flex-col items-center text-center">
            <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em] mb-4">Next Up</p>
            <h2
              className="font-black text-white leading-none mb-3"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 8vw, 96px)" }}
            >
              VOL. 4
            </h2>
            <p
              className="font-black leading-none mb-8"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                WebkitTextStroke: "2px rgba(255,255,255,0.15)",
                color: "transparent",
              }}
            >
              COMING SOON.
            </p>
            <p className="text-white/30 text-sm mb-10 max-w-sm">
              Details dropping soon. Join the WhatsApp group to be first to know.
            </p>
            <a
              href="https://wa.me/23055151185"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#25D366] text-white text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#1ebe5b] transition-colors"
            >
              <SiWhatsapp className="w-4 h-4" />
              Join WhatsApp Group
            </a>
          </div>
        )}

        {/* Past Events — no description page, these link straight into the
            Gallery (filtered by volume) or the ACCESS page. */}
        {!isLoading && (
          <div className="mt-20 sm:mt-28 pt-16 border-t border-white/10">
            <div className="flex items-center gap-4 mb-14">
              <span className="w-8 h-px bg-white/20" />
              <span className="text-white/40 text-[10px] uppercase tracking-[0.35em]">Past Events</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
              <Reveal className="bg-black">
                <AccessCard accessEvent={accessData?.event} />
              </Reveal>
              {past.map((event, idx) => (
                <Reveal key={event.id} className="bg-black" delay={((idx + 1) % 3) * 0.08}>
                  <PastEventCard event={event} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
