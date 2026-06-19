import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Event } from "@shared/schema";

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="group block border border-white/10 hover:border-white/25 transition-all duration-300">
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
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

export default function EventsPage() {
  const { data: events = [], isLoading } = useQuery<{ success: boolean; events: Event[] }, Error, Event[]>({
    queryKey: ["/api/events"],
    select: (data) => data.events ?? [],
  });

  const upcoming = events.filter((e) => !e.isPast);
  const hasPast = events.some((e) => e.isPast);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-20 sm:pb-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-14">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Events</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end border-b border-white/10 pb-16 mb-16">
          <h1
            className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(52px, 8vw, 100px)" }}
          >
            UPCOMING
            <br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
              EVENTS.
            </span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Every AFTR night is a new chapter. Check what's coming and secure your spot before it sells out.
          </p>
        </div>

        {/* Upcoming events */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black h-64 animate-pulse" />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 mb-20">
            {upcoming.map((event) => (
              <div key={event.id} className="bg-black">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-white/10 p-12 text-center mb-20">
            <p
              className="font-black text-white/20 mb-3"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "48px" }}
            >
              COMING SOON.
            </p>
            <p className="text-white/25 text-sm">No upcoming events announced yet. Follow us to be first to know.</p>
          </div>
        )}

        {/* Past events link */}
        <div className="border-t border-white/10 pt-12 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium mb-1">Looking for past events?</p>
            <p className="text-white/30 text-xs">Relive the nights — Vol. 1 through Vol. 3.</p>
          </div>
          <Link
            href="/events/past"
            className="group inline-flex items-center gap-3 border border-white/15 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 hover:border-white/40 hover:text-white transition-all"
          >
            Past Events
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
