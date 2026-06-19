import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import aftrVol1Image from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/IMG_6112_1774435245159.jpg";
import aftrVol3Image from "@assets/Promo_poster_1_1777967218262.png";
import bannerImage from "@assets/Serge_83_1777968402525.jpg";

const timeline = [
  {
    number: "01",
    edition: "VOL. 1",
    name: "AFTR: The Rave",
    date: "27 Sep 2025",
    venue: "Shotz, Flic en Flac",
    description: "The night that started it all. 5 DJs, non-stop music from 10PM to 4AM — the most electric rave Mauritius had seen.",
    image: aftrVol1Image,
    imageAlt: "AFTR Vol. 1 — The Rave",
  },
  {
    number: "02",
    edition: "VOL. 2",
    name: "AFTR Vol. 2",
    date: "30 Jan 2026",
    venue: "Shotz, Flic en Flac",
    description: "A packed dancefloor, harder-hitting energy, and a night that proved AFTR is only getting started.",
    image: aftrVol2Image,
    imageAlt: "AFTR Vol. 2",
  },
  {
    number: "03",
    edition: "VOL. 3",
    name: "AFTR Vol. 3",
    date: "18 Apr 2026",
    venue: "Shotz, Flic en Flac",
    description: "The biggest night yet. Every corner packed, every moment electric. Vol. 3 set a new standard for what AFTR means to Mauritius.",
    image: aftrVol3Image,
    imageAlt: "AFTR Vol. 3",
  },
];

const values = [
  {
    label: "01",
    title: "Curation Over Volume",
    desc: "We don't book the most DJs. We book the right ones. Every lineup is deliberate, every genre chosen for the crowd in the room.",
  },
  {
    label: "02",
    title: "Community First",
    desc: "AFTR exists because of the people who show up. We build for our community — not for clout, not for numbers, but for the nights they remember.",
  },
  {
    label: "03",
    title: "Quality Is Non-Negotiable",
    desc: "From the sound system to the venue to the door policy — every detail matters. If it doesn't meet the standard, it doesn't make the cut.",
  },
  {
    label: "04",
    title: "Mauritius On The Map",
    desc: "We are building something the island has never seen. Every volume is a statement that Mauritius nightlife belongs in the same conversation as anywhere else.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Hero Banner — keep intact ──────────────────────────────────────── */}
      <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <img
          src={bannerImage}
          alt="AFTR — After Dark Socials"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-6 lg:px-12 pb-12 sm:pb-16">
          <div className="flex items-center gap-4 mb-5">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">About</span>
          </div>
          <h1
            className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(56px, 10vw, 120px)" }}
          >
            MORE THAN
            <br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.2)", color: "transparent" }}>
              A PARTY.
            </span>
          </h1>
        </div>
      </div>

      {/* ── Story ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-5">
              <p className="text-white/60 text-base leading-[1.9]">
                After Dark Socials was founded on a single belief — that Mauritius deserves better nights out.
              </p>
              <p className="text-white/40 text-sm leading-[1.9]">
                Not another beach bar playlist. Not another predictable lineup. Something real — with curated music, serious production, and a crowd that shows up because they care.
              </p>
              <p className="text-white/40 text-sm leading-[1.9]">
                We started in September 2025 with Vol. 1, a sold-out night at Shotz that drew over 500 people and left everyone asking when the next one was.
              </p>
              <p className="text-white/40 text-sm leading-[1.9]">
                Three editions later, AFTR has become synonymous with quality nightlife in Mauritius. We are not the biggest event on the island. We are the one people talk about.
              </p>
            </div>
            <div className="space-y-5">
              <p className="text-white/40 text-sm leading-[1.9]">
                Our events span multiple genres — Afrobeats, Tech House, Amapiano, R&B — because we believe great nights do not have a single sound. They have energy.
              </p>
              <p className="text-white/40 text-sm leading-[1.9]">
                Beyond the events, AFTR runs ACCESS — a private social night for the people who want more than raves. It is a community built around the most passionate nightlife enthusiasts on the island.
              </p>
              <p className="text-white/40 text-sm leading-[1.9]">
                We also work with brands, corporates, and private clients who want to tap into the energy and audience we have built. If you want Mauritius to know your name, a night with AFTR is the fastest way to get there.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
        <div className="flex items-center gap-4 mb-14">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Timeline</span>
        </div>
        <h2
          className="font-black text-white leading-none mb-16"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 8vw, 100px)" }}
        >
          THE NIGHTS
          <br />
          <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>SO FAR.</span>
        </h2>

        {/* Desktop 5-col grid */}
        <div className="hidden lg:block">
          {/* Column headers */}
          <div className="grid grid-cols-[40px_80px_1fr_2fr_200px] gap-6 pb-3 border-b border-white/10 mb-0">
            {["#", "Vol.", "Date / Venue", "Description", ""].map((h) => (
              <span key={h} className="text-[9px] text-white/20 uppercase tracking-[0.3em]">{h}</span>
            ))}
          </div>
          {timeline.map((ev, i) => (
            <div
              key={ev.number}
              className="grid grid-cols-[40px_80px_1fr_2fr_200px] gap-6 border-b border-white/10 items-center group"
            >
              {/* Number */}
              <span
                className="text-white/15 font-black py-8"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "22px" }}
              >
                {ev.number}
              </span>
              {/* Edition */}
              <span
                className="text-[#c72d28] font-black"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "20px" }}
              >
                {ev.edition}
              </span>
              {/* Date + venue */}
              <div>
                <p className="text-white text-sm font-medium mb-1">{ev.date}</p>
                <p className="text-white/30 text-xs">{ev.venue}</p>
              </div>
              {/* Description */}
              <p className="text-white/30 text-sm leading-relaxed">{ev.description}</p>
              {/* Photo */}
              <div className="relative h-24 overflow-hidden my-4">
                <img
                  src={ev.image}
                  alt={ev.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile stacked */}
        <div className="lg:hidden space-y-0">
          {timeline.map((ev) => (
            <div key={ev.number} className="border-t border-white/10 py-8 grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em]">{ev.edition}</span>
                <span className="text-white/20 text-xs">{ev.date}</span>
              </div>
              <div className="relative h-40 overflow-hidden">
                <img
                  src={ev.image}
                  alt={ev.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1">{ev.venue}</p>
                <p className="text-white/40 text-sm leading-relaxed">{ev.description}</p>
              </div>
            </div>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>

      {/* ── Brand Values ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
          <div className="flex items-center gap-4 mb-14">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">What We Stand For</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-white/10">
            {values.map((v, i) => (
              <div
                key={v.label}
                className={`p-8 sm:p-10 group hover:bg-white/[0.02] transition-colors ${
                  i % 2 === 0 ? "sm:border-r border-white/10" : ""
                } ${
                  i < 2 ? "border-b border-white/10" : ""
                }`}
              >
                <p
                  className="text-white/10 font-black leading-none mb-5"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "40px" }}
                >
                  {v.label}
                </p>
                <h3
                  className="text-white font-black leading-none mb-4"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(24px, 3vw, 36px)" }}
                >
                  {v.title.toUpperCase()}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-24">
          <h2
            className="font-black text-white leading-none mb-10"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 7vw, 88px)" }}
          >
            READY TO
            <br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
              JOIN?
            </span>
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/events"
              className="group inline-flex items-center gap-3 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#a82421] transition-colors"
            >
              Get Tickets
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/access"
              className="group inline-flex items-center gap-3 bg-[#c9962a] text-black text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#b8860b] transition-colors"
            >
              RSVP ACCESS
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
