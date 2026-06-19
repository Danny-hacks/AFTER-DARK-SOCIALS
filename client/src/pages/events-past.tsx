import { Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import aftrVol1Image from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/IMG_6112_1774435245159.jpg";
import aftrVol3Image from "@assets/Promo_poster_1_1777967218262.png";

const pastEvents = [
  {
    edition: "Vol. 3",
    name: "AFTR VOL. 3",
    subtitle: "Full Capacity.",
    date: "18 Apr 2026",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description:
      "The biggest night yet. Every corner packed, every moment electric. Vol. 3 set a new standard for what AFTR means to Mauritius.",
    image: aftrVol3Image,
    artists: [],
  },
  {
    edition: "Vol. 2",
    name: "AFTR VOL. 2",
    subtitle: "The Bar Raised.",
    date: "30 Jan 2026",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description:
      "A packed dancefloor, harder-hitting energy, and a night that proved AFTR is only getting started.",
    image: aftrVol2Image,
    artists: ["DJ AFROKEYZ", "DJ LUVLESH", "DJ SWAY", "DJ ALVIN", "DJ SMARTFINGER", "DJ AVI.S"],
  },
  {
    edition: "Vol. 1",
    name: "AFTR: THE RAVE",
    subtitle: "Where It Began.",
    date: "27 Sep 2025",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description:
      "The night that started it all. 5 DJs, non-stop music from 10PM to 4AM — the most electric rave Mauritius had seen.",
    image: aftrVol1Image,
    artists: ["DJ ALVIN", "DJ LUVLESH", "STEVOTHEDJ", "DJ SWAY", "DJ AFROKEYZ"],
  },
];

export default function EventsPastPage() {
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
            Three volumes. Three chapters in the AFTR story. Every night a new bar set — every crowd a new energy.
          </p>
        </div>

        {/* Events list */}
        {pastEvents.map((ev, i) => (
          <div
            key={ev.edition}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/10 group`}
          >
            {/* Image */}
            <div className="lg:col-span-5 relative overflow-hidden h-56 sm:h-72 lg:h-auto">
              <img
                src={ev.image}
                alt={ev.name}
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute top-5 left-5">
                <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em]">{ev.edition}</span>
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
              <p
                className="mb-5"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "18px", color: "rgba(255,255,255,0.2)" }}
              >
                {ev.subtitle}
              </p>

              <div className="flex flex-wrap gap-5 mb-6">
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{ev.date}</span>
                </div>
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{ev.time}</span>
                </div>
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{ev.venue}</span>
                </div>
              </div>

              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-lg">{ev.description}</p>

              {ev.artists.length > 0 && (
                <div className="mb-8">
                  <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-3">Lineup</p>
                  <div className="flex flex-wrap gap-2">
                    {ev.artists.map((artist) => (
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
