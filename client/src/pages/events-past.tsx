import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowUpRight, Loader2, Image as ImageIcon } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { AccessEvent, Event } from "@shared/schema";

function parseArtists(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function EventsPastPage() {
  usePageTitle("Past Events");

  const { data: pastEvents = [], isLoading } = useQuery<{ success: boolean; events: Event[] }, Error, Event[]>({
    queryKey: ["/api/events/past"],
    select: (data) => data.events ?? [],
  });
  // This page is meant to be "the" past-events archive (linked from the
  // footer) — it needs to match what /events#past-events shows, which
  // includes past ACCESS editions too, not just AFTR ones.
  const { data: pastAccessEvents = [], isLoading: isLoadingAccess } = useQuery<{ success: boolean; events: AccessEvent[] }, Error, AccessEvent[]>({
    queryKey: ["/api/access/past"],
    select: (data) => data.events ?? [],
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-20 sm:pb-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-14">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Archive</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end border-b border-white/10 pb-16 mb-0">
          <h1
            className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(52px, 8vw, 100px)" }}
          >
            THE NIGHTS
            <br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
              SO FAR.
            </span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Every volume, every chapter in the AFTR story. Every night a new bar set — every crowd a new energy.
          </p>
        </div>

        {(isLoading || isLoadingAccess) && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
          </div>
        )}

        {!isLoading && !isLoadingAccess && pastEvents.length === 0 && pastAccessEvents.length === 0 && (
          <div className="text-center py-24 text-white/20 text-sm uppercase tracking-widest">
            No past events yet.
          </div>
        )}

        {/* Events list */}
        {pastEvents.map((ev, i) => {
          const artists = parseArtists(ev.artists);
          return (
            <div
              key={ev.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/10 group"
            >
              {/* Image */}
              <div className="lg:col-span-5 relative overflow-hidden h-56 sm:h-72 lg:h-auto bg-[#0a0a0a]">
                {ev.imageUrl && (
                  <img
                    src={ev.imageUrl}
                    alt={ev.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                )}
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
                {ev.volume && (
                  <div className="absolute top-5 left-5">
                    <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em]">{ev.volume}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="lg:col-span-7 py-10 sm:py-12 lg:px-12 xl:px-16 flex flex-col justify-center">
                <h2
                  className="text-white leading-none mb-3"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px, 5vw, 72px)" }}
                >
                  {ev.name}
                </h2>
                {ev.subtitle && (
                  <p
                    className="mb-5"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.2)" }}
                  >
                    {ev.subtitle}
                  </p>
                )}

                <div className="flex flex-wrap gap-5 mb-6">
                  {ev.date && (
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{ev.date}</span>
                    </div>
                  )}
                  {ev.time && (
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{ev.time}</span>
                    </div>
                  )}
                  {ev.venue && (
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{ev.venue}</span>
                    </div>
                  )}
                </div>

                {ev.description && (
                  <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-lg">{ev.description}</p>
                )}

                {artists.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-3">Lineup</p>
                    <div className="flex flex-wrap gap-2">
                      {artists.map((artist) => (
                        <span
                          key={artist}
                          className="text-[9px] uppercase tracking-[0.15em] border border-white/10 text-white/30 px-3 py-1"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 flex-wrap">
                  {ev.volume && (
                    <Link
                      href={`/gallery?vol=${encodeURIComponent(ev.volume)}`}
                      className="group/link inline-flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-colors w-fit"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      View {ev.volume} Gallery
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>
                  )}
                  <Link
                    href={`/events/${ev.slug ?? ev.id}`}
                    className="text-white/20 hover:text-white/60 text-[10px] uppercase tracking-[0.2em] transition-colors w-fit"
                  >
                    Event Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Past ACCESS editions */}
        {pastAccessEvents.map((ev) => (
          <div
            key={ev.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/10 group"
          >
            {/* Image */}
            <div className="lg:col-span-5 relative overflow-hidden h-56 sm:h-72 lg:h-auto bg-[#0a0a0a]">
              {ev.bannerUrl && (
                <img
                  src={ev.bannerUrl}
                  alt={ev.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute top-5 left-5">
                <span className="text-[#c9962a] text-[9px] uppercase tracking-[0.35em]">Private Social</span>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7 py-10 sm:py-12 lg:px-12 xl:px-16 flex flex-col justify-center">
              <h2
                className="text-white leading-none mb-3"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                {ev.name}
              </h2>

              <div className="flex flex-wrap gap-5 mb-6">
                {ev.date && (
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{ev.date}</span>
                  </div>
                )}
                {ev.time && (
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{ev.time}</span>
                  </div>
                )}
                {ev.venue && (
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{ev.venue}</span>
                  </div>
                )}
              </div>

              {ev.description && (
                <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-lg">{ev.description}</p>
              )}

              <Link
                href="/access#past-editions"
                className="group/link inline-flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-colors w-fit"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                View ACCESS
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        ))}

        {/* Back to upcoming */}
        <div className="pt-12 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium mb-1">What's next?</p>
            <p className="text-white/30 text-xs">Check out upcoming events and get your ticket.</p>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-3 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-3 hover:bg-[#a82421] transition-colors"
          >
            Upcoming Events
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
