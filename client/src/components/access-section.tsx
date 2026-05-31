import { ArrowUpRight, Sun, Moon } from "lucide-react";

const experiences = [
  {
    icon: Sun,
    time: "From 4PM",
    title: "Sundowner",
    description: "Curated cocktails, ambient sounds, and golden-hour views — the perfect start to an After Dark evening.",
  },
  {
    icon: ArrowUpRight,
    time: "From 8PM",
    title: "Lounge Hour",
    description: "Premium bottle service, reserved seating, and a soundtrack that shifts from relaxed to electric.",
  },
  {
    icon: Moon,
    time: "From 10PM",
    title: "After Dark",
    description: "Exclusive entry, intimate atmosphere, and the kind of energy you can only find After Dark.",
  },
];

const details = [
  { label: "Format",  value: "Exclusive Lounge" },
  { label: "Vibe",    value: "Sundowner → After Dark" },
  { label: "Entry",   value: "By Invitation / Booking" },
  { label: "Service", value: "Bottle & Table" },
];

export default function AccessSection() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="access"
      className="relative bg-black py-20 sm:py-28 overflow-hidden border-t border-white/10"
      data-testid="access-section"
    >
      {/* Atmospheric glow — hidden on mobile for perf */}
      <div className="hidden sm:block absolute top-0 right-0 w-[500px] h-[500px] bg-[#b8860b]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#b8860b]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-14 sm:mb-16">
          <span className="w-8 h-px bg-[#b8860b] flex-shrink-0" />
          <span className="text-[#b8860b] text-[10px] uppercase tracking-[0.35em] font-medium">
            Exclusive Experience
          </span>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-28 items-start">

          {/* ── LEFT: Identity ── */}
          <div>
            {/* ACCESS wordmark */}
            <div className="mb-6 sm:mb-8">
              <h2
                className="font-black leading-none tracking-tight"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: "clamp(80px, 18vw, 160px)",
                  background: "linear-gradient(135deg, #d4a017 0%, #f5d76e 45%, #b8860b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                data-testid="access-title"
              >
                ACCESS
              </h2>
              <p
                className="text-white/25 text-[10px] uppercase tracking-[0.4em] mt-1"
                data-testid="access-subtitle"
              >
                By After Dark Socials
              </p>
            </div>

            {/* Description */}
            <p
              className="text-white/55 leading-[1.8] mb-4"
              style={{ fontSize: "14px" }}
              data-testid="access-description"
            >
              ACCESS is not an event. It's an experience reserved for those
              who know. An exclusive lounge concept — from golden-hour
              sundowners to late-night After Dark sessions — designed for
              Mauritius' most discerning crowd.
            </p>
            <p
              className="text-white/30 leading-[1.8] mb-8 sm:mb-10"
              style={{ fontSize: "13px" }}
            >
              Reserved seating. Premium service. A carefully curated atmosphere
              that transitions from sunset to sunrise. When you have ACCESS,
              the night is yours.
            </p>

            {/* Detail grid — 2x2, responsive */}
            <div className="grid grid-cols-2 gap-px bg-white/10 mb-8 sm:mb-10">
              {details.map((d) => (
                <div key={d.label} className="bg-black p-4 sm:p-5">
                  <p className="text-[9px] text-[#b8860b]/50 uppercase tracking-[0.25em] mb-1">{d.label}</p>
                  <p className="text-white text-xs sm:text-sm font-medium">{d.value}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-4 border border-[#b8860b]/40 text-[#b8860b] text-[10px] uppercase tracking-[0.2em] font-bold px-6 sm:px-8 py-3 sm:py-4 hover:bg-[#b8860b] hover:text-black transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start"
              data-testid="access-cta"
            >
              Request ACCESS
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* ── RIGHT: Experience timeline ── */}
          <div className="mt-4 lg:mt-0">
            <div className="space-y-px">
              {experiences.map((exp, i) => (
                <div
                  key={exp.title}
                  className="group bg-[#050505] border border-white/5 p-6 sm:p-8 hover:border-[#b8860b]/20 transition-all duration-300"
                  data-testid={`access-experience-${i}`}
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    {/* Icon box */}
                    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 border border-[#b8860b]/30 flex items-center justify-center group-hover:border-[#b8860b]/60 transition-colors mt-0.5">
                      <exp.icon className="w-3.5 h-3.5 text-[#b8860b]/60 group-hover:text-[#b8860b] transition-colors" strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-[#b8860b]/50 uppercase tracking-[0.3em] mb-2">
                        {exp.time}
                      </p>
                      <h3
                        className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3"
                        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                      >
                        {exp.title}
                      </h3>
                      <p className="text-white/30 text-xs sm:text-sm leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Availability note */}
              <div className="bg-[#050505] border border-[#b8860b]/20 p-5 sm:p-6">
                <p className="text-[9px] text-[#b8860b]/50 uppercase tracking-[0.25em] mb-2">
                  Availability
                </p>
                <p className="text-white/30 text-xs leading-relaxed">
                  ACCESS experiences are limited and by booking only. DM us on
                  Instagram or use the contact form to secure your spot.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}