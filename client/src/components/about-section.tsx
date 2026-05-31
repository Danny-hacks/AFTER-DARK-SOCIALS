import { Music, Users, Zap, Heart, ArrowUpRight } from "lucide-react";

const stats = [
  { value: "3",    label: "Events" },
  { value: "8+",   label: "DJs" },
  { value: "3",    label: "Venues" },
  { value: "2025", label: "Est." },
];

const pillars = [
  { icon: Music, title: "Multiple Genres",  desc: "Amapiano, Afrobeats, Hip Hop, House." },
  { icon: Users, title: "Top DJs",          desc: "Mauritius' finest selectors and rising talents." },
  { icon: Zap,   title: "Non-Stop Energy",  desc: "6+ hours of continuous, unstoppable music." },
  { icon: Heart, title: "Community",        desc: "A family of ravers united by the love of music." },
];

export default function AboutSection() {
  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="about" className="py-20 sm:py-28 bg-black" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-14 sm:mb-20">
          <span className="section-line" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em] font-medium">About</span>
        </div>

        {/* ── HEADLINE BLOCK ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/10">

          {/* Heading — 7 cols */}
          <div className="lg:col-span-7 pb-10 sm:pb-16 lg:border-r border-white/10 lg:pr-16">
            <h2
              className="font-black text-white leading-[0.88] tracking-tight"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "clamp(64px, 10vw, 140px)",
              }}
              data-testid="about-title"
            >
              MORE<br />
              THAN A<br />
              <span style={{
                WebkitTextStroke: "2px rgba(255,255,255,0.18)",
                color: "transparent",
              }}>
                PARTY.
              </span>
            </h2>
          </div>

          {/* Mobile divider — only shows between heading and body on mobile */}
          <div className="lg:hidden w-full h-px bg-white/10 my-0" />

          {/* Body — 5 cols */}
          <div className="lg:col-span-5 pt-10 pb-14 sm:pt-0 sm:pb-16 lg:pl-16 flex flex-col justify-end gap-5">
            <p
              className="text-white/55 leading-[1.8]"
              style={{ fontSize: "14px" }}
              data-testid="about-description"
            >
              After Dark Socials is a movement. Born from the underground rave
              culture of Mauritius, we bring together the island's finest DJs,
              pulsating beats, and an electrifying atmosphere that keeps you
              dancing until the sun comes up.
            </p>
            <p
              className="text-white/30 leading-[1.8]"
              style={{ fontSize: "13px" }}
              data-testid="about-description-2"
            >
              From Amapiano to Afrobeats, Hip Hop to House — we curate sonic
              experiences that unite people through the universal language of
              music. When the city sleeps, AFTR comes alive.
            </p>
            <button
              onClick={scrollToServices}
              className="group self-start mt-1 inline-flex items-center gap-3 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.25em] transition-colors font-medium"
              data-testid="view-events-button"
            >
              See what we do
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-8 sm:py-10 px-5 sm:px-8 flex flex-col items-start justify-center
                ${i % 2 === 0 ? "border-r border-white/10" : ""}
                ${i < 2 ? "border-b sm:border-b-0 border-white/10" : ""}
                sm:${i < stats.length - 1 ? "border-r" : ""} sm:border-b-0
              `}
            >
              <div
                className="font-black text-white leading-none mb-1.5"
                style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: "clamp(40px, 4.5vw, 72px)",
                }}
              >
                {stat.value}
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/25 uppercase tracking-[0.3em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── PILLARS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10">
          {pillars.map((item, i) => (
            <div
              key={item.title}
              className={`group py-8 sm:py-10 px-5 sm:px-8 flex flex-col gap-4 hover:bg-white/[0.02] transition-colors border-b border-white/10
                last:border-b-0
                sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-white/10
                lg:border-b-0 lg:border-r lg:border-white/10 lg:last:border-r-0
              `}
              data-testid={`about-feature-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="w-8 h-8 border border-white/10 flex items-center justify-center group-hover:border-[#c72d28]/40 transition-colors flex-shrink-0">
                <item.icon className="w-3.5 h-3.5 text-[#c72d28]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1.5 tracking-wide">{item.title}</h3>
                <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}