import { ArrowUpRight, Sun, Moon, Martini } from "lucide-react";

const experiences = [
  {
    icon: Sun,
    time: "From 4PM",
    title: "Sundowner",
    description:
      "As the Mauritius sun dips below the horizon, ACCESS opens its doors. Curated cocktails, ambient sounds, and golden-hour views — the perfect start to an After Dark evening.",
  },
  {
    icon: Martini,
    time: "From 8PM",
    title: "Lounge Hour",
    description:
      "Transition into the night with premium bottle service, reserved seating, and a soundtrack that shifts from relaxed to electric. This is where the night takes shape.",
  },
  {
    icon: Moon,
    time: "From 10PM",
    title: "After Dark",
    description:
      "When the city goes to sleep, ACCESS stays alive. Exclusive entry, intimate atmosphere, and the kind of energy you can only find After Dark.",
  },
];

export default function AccessSection() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="access"
      className="relative bg-black py-28 overflow-hidden border-t border-white/10"
      data-testid="access-section"
    >
      {/* Atmospheric gold glow — distinct from the red used elsewhere */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b8860b]/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#b8860b]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="w-8 h-px bg-[#b8860b]" />
          <span className="text-[#b8860b] text-xs uppercase tracking-[0.3em] font-medium">
            Exclusive Experience
          </span>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-20">
          {/* Left — Identity */}
          <div>
            {/* ACCESS wordmark */}
            <div className="mb-8">
              <h2
                className="text-[min(22vw,160px)] font-black leading-none tracking-tight"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  background:
                    "linear-gradient(135deg, #d4a017 0%, #f5d76e 40%, #b8860b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                data-testid="access-title"
              >
                ACCESS
              </h2>
              <p
                className="text-white/30 text-sm uppercase tracking-[0.4em] -mt-2"
                data-testid="access-subtitle"
              >
                By After Dark Socials
              </p>
            </div>

            <p
              className="text-white/60 text-lg leading-relaxed mb-6"
              data-testid="access-description"
            >
              ACCESS is not an event. It's an experience reserved for those who
              know. An exclusive lounge concept — from golden-hour sundowners to
              late-night After Dark sessions — designed for Mauritius' most
              discerning crowd.
            </p>
            <p className="text-white/30 text-base leading-relaxed mb-12">
              Reserved seating. Premium service. A carefully curated atmosphere
              that transitions from sunset to sunrise. When you have ACCESS, the
              night is yours.
            </p>

            {/* Key details */}
            <div className="grid grid-cols-2 gap-px bg-white/10 mb-12">
              {[
                { label: "Format", value: "Exclusive Lounge" },
                { label: "Vibe", value: "Sundowner → After Dark" },
                { label: "Entry", value: "By Invitation / Booking" },
                { label: "Service", value: "Bottle & Table" },
              ].map((detail) => (
                <div key={detail.label} className="bg-black p-5">
                  <p className="text-[10px] text-[#b8860b]/60 uppercase tracking-[0.25em] mb-1">
                    {detail.label}
                  </p>
                  <p className="text-white text-sm font-medium">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-4 border border-[#b8860b]/40 text-[#b8860b] text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#b8860b] hover:text-black transition-all duration-300"
              data-testid="access-cta"
            >
              Request ACCESS
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Right — Experience timeline */}
          <div className="space-y-px">
            {experiences.map((exp, index) => (
              <div
                key={exp.title}
                className="group bg-[#050505] border border-white/5 p-8 hover:border-[#b8860b]/20 transition-all duration-300"
                data-testid={`access-experience-${index}`}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-10 h-10 border border-[#b8860b]/30 flex items-center justify-center group-hover:border-[#b8860b]/60 transition-colors">
                    <exp.icon
                      className="w-4 h-4 text-[#b8860b]/60 group-hover:text-[#b8860b] transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-[#b8860b]/50 uppercase tracking-[0.3em]">
                        {exp.time}
                      </p>
                    </div>
                    <h3
                      className="text-2xl font-black text-white mb-3"
                      style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                    >
                      {exp.title}
                    </h3>
                    <p className="text-white/30 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom note */}
            <div className="bg-[#050505] border border-[#b8860b]/20 p-6 mt-px">
              <p className="text-[#b8860b]/60 text-xs uppercase tracking-[0.25em] mb-2">
                Availability
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                ACCESS experiences are limited and by booking only. DM us on
                Instagram or use the contact form to secure your spot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
