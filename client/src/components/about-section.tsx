import { Music, Users, Zap, Heart } from "lucide-react";

const stats = [
  { value: "5+", label: "DJs" },
  { value: "6H", label: "Non-Stop" },
  { value: "2+", label: "Events" },
  { value: "1", label: "Island" },
];

const pillars = [
  {
    icon: Music,
    title: "Multiple Genres",
    desc: "Amapiano, Afrobeats, Hip Hop, House, and everything in between.",
  },
  {
    icon: Users,
    title: "Top DJs",
    desc: "Featuring Mauritius' finest selectors and rising talents.",
  },
  {
    icon: Zap,
    title: "Non-Stop Energy",
    desc: "6+ hours of continuous music and unstoppable vibes.",
  },
  {
    icon: Heart,
    title: "Community",
    desc: "A family of ravers united by the love of music.",
  },
];

export default function AboutSection() {
  const scrollToEvents = () => {
    document.getElementById('past-events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about" className="py-28 bg-black relative" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-line" />
          <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em] font-medium">
            About
          </span>
        </div>

        {/* Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-start">
          <div>
            <h2
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight"
              data-testid="about-title"
            >
              MORE<br />THAN A<br />PARTY.
            </h2>
          </div>
          <div className="pt-2 lg:pt-6">
            <p className="text-white/60 text-lg leading-relaxed mb-6" data-testid="about-description">
              After Dark Social is a movement. Born from the underground rave culture of Mauritius, 
              we bring together the island's finest DJs, pulsating beats, and an electrifying 
              atmosphere that keeps you dancing until the sun comes up.
            </p>
            <p className="text-white/40 text-base leading-relaxed" data-testid="about-description-2">
              From Amapiano to Afrobeats, Hip Hop to House — we curate sonic experiences that unite 
              people through the universal language of music. When the city sleeps, AFTR comes alive.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-white/10 mb-20">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-8 text-center ${i < stats.length - 1 ? 'border-r border-white/10' : ''}`}
            >
              <div
                className="text-5xl font-black text-white mb-2"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="bg-black p-8 group hover:bg-[#0a0a0a] transition-colors"
              data-testid={`about-feature-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-6 h-6 text-[#c72d28] mb-6" strokeWidth={1.5} />
              <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-start">
          <button
            onClick={scrollToEvents}
            className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-[0.2em]"
            data-testid="view-events-button"
          >
            <span className="w-10 h-px bg-current transition-all group-hover:w-16" />
            See Our Events
          </button>
        </div>
      </div>
    </section>
  );
}
