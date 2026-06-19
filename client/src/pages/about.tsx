import { Link } from "wouter";
import { ArrowUpRight, Music, Users, Zap, Heart } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import aftrVol1Image from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/IMG_6112_1774435245159.jpg";
import aftrVol3Image from "@assets/Promo_poster_1_1777967218262.png";
import bannerImage from "@assets/Serge_83_1777968402525.jpg";

const stats = [
  { value: "3",    label: "Events" },
  { value: "8+",   label: "DJs" },
  { value: "3",    label: "Venues" },
  { value: "2025", label: "Est." },
];

const pillars = [
  { icon: Music, title: "Multiple Genres",  desc: "Amapiano, Afrobeats, Hip Hop, House — curated for every corner of the dancefloor." },
  { icon: Users, title: "Top DJs",          desc: "Mauritius' finest selectors and rising talents, hand-picked every volume." },
  { icon: Zap,   title: "Non-Stop Energy",  desc: "6+ hours of continuous, unstoppable music from 10PM to dawn." },
  { icon: Heart, title: "Community",        desc: "A family of ravers united by the love of music and the spirit of the night." },
];

const timeline = [
  {
    edition: "Vol. 1",
    name: "AFTR: The Rave",
    date: "27 Sep 2025",
    venue: "Shotz, Flic en Flac",
    description: "The night that started it all. 5 DJs, non-stop music from 10PM to 4AM — the most electric rave Mauritius had seen.",
    image: aftrVol1Image,
  },
  {
    edition: "Vol. 2",
    name: "AFTR Vol. 2",
    date: "30 Jan 2026",
    venue: "Shotz, Flic en Flac",
    description: "A packed dancefloor, harder-hitting energy, and a night that proved AFTR is only getting started.",
    image: aftrVol2Image,
  },
  {
    edition: "Vol. 3",
    name: "AFTR Vol. 3",
    date: "18 Apr 2026",
    venue: "Shotz, Flic en Flac",
    description: "The biggest night yet. Every corner packed, every moment electric. Vol. 3 set a new standard for what AFTR means to Mauritius.",
    image: aftrVol3Image,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
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

      {/* ── 2-col intro ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28 border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <p className="text-white/55 text-base leading-[1.9]">
            After Dark Socials is a movement. Born from the underground rave culture of Mauritius, we bring together the island's finest DJs, pulsating beats, and an electrifying atmosphere that keeps you dancing until the sun comes up.
          </p>
          <p className="text-white/30 text-sm leading-[1.9]">
            From Amapiano to Afrobeats, Hip Hop to House — we curate sonic experiences that unite people through the universal language of music. When the city sleeps, AFTR comes alive. Three volumes in, we're only getting started.
          </p>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-8 sm:py-12 flex flex-col items-start justify-center
                ${i % 2 === 0 ? "border-r border-white/10" : ""}
                ${i < 2 ? "border-b sm:border-b-0 border-white/10" : ""}
                sm:${i < stats.length - 1 ? "border-r" : ""} sm:border-b-0
              `}
            >
              <div
                className="font-black text-white leading-none mb-1.5"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px, 5vw, 72px)" }}
              >
                {stat.value}
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/25 uppercase tracking-[0.3em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
        <div className="flex items-center gap-4 mb-16">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Timeline</span>
        </div>
        <h2
          className="font-black text-white leading-none mb-16 sm:mb-20"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 8vw, 100px)" }}
        >
          THE NIGHTS SO FAR.
        </h2>
        <div className="space-y-0">
          {timeline.map((ev, i) => (
            <div
              key={ev.edition}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-white/10 ${
                i === timeline.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              {/* Image */}
              <div className="lg:col-span-4 relative overflow-hidden h-48 lg:h-auto">
                <img
                  src={ev.image}
                  alt={ev.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              {/* Content */}
              <div className="lg:col-span-8 py-10 lg:py-12 lg:px-12 flex flex-col justify-center">
                <p className="text-[#c72d28] text-[9px] uppercase tracking-[0.35em] mb-3">{ev.edition}</p>
                <h3
                  className="text-white leading-none mb-2"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px, 5vw, 64px)" }}
                >
                  {ev.name}
                </h3>
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-white/30 text-[10px] uppercase tracking-[0.2em]">{ev.date}</span>
                  <span className="text-white/15 text-[10px]">/</span>
                  <span className="text-white/30 text-[10px] uppercase tracking-[0.2em]">{ev.venue}</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed max-w-lg">{ev.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Brand Values ────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
          <div className="flex items-center gap-4 mb-16">
            <span className="w-8 h-px bg-[#c72d28]" />
            <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">What We Stand For</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/10">
            {pillars.map((item, i) => (
              <div
                key={item.title}
                className={`group p-8 sm:p-10 flex flex-col gap-5 hover:bg-white/[0.02] transition-colors
                  ${i < 3 ? "border-b lg:border-b-0 lg:border-r border-white/10" : ""}
                  ${i < 2 ? "sm:border-b border-white/10 sm:border-r-0" : ""}
                `}
              >
                <div className="w-8 h-8 border border-white/10 flex items-center justify-center group-hover:border-[#c72d28]/40 transition-colors">
                  <item.icon className="w-3.5 h-3.5 text-[#c72d28]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2 tracking-wide">{item.title}</h3>
                  <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/access"
            className="group inline-flex items-center gap-3 bg-[#c9962a] text-black text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#b8860b] transition-colors"
          >
            Book ACCESS
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-3 border border-white/15 text-white/50 text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:border-white/40 hover:text-white transition-all"
          >
            View Gallery
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 text-white/30 text-[10px] uppercase tracking-[0.25em] font-medium hover:text-white transition-colors"
          >
            Contact Us
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
