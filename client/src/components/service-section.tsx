import { ArrowUpRight } from "lucide-react";

const services = [
  {
    number: "01",
    title: "AFTR Events",
    subtitle: "Rave Series",
    description:
      "Our flagship rave series. Curated lineups, pulsating energy, and nights that Mauritius won't forget. Tickets, tables, and VIP available.",
    tag: "Ticketing & Bookings",
    cta: "View Past Events",
    ctaTarget: "past-events",
    accent: true,
  },
  {
    number: "02",
    title: "Private Bookings",
    subtitle: "Your Night, Your Way",
    description:
      "Birthday parties, private celebrations, intimate gatherings. We handle the curation, the DJs, the atmosphere — you just show up.",
    tag: "Bespoke Experiences",
    cta: "Enquire Now",
    ctaTarget: "contact",
    accent: false,
  },
  {
    number: "03",
    title: "Corporate Events",
    subtitle: "Beyond the Boardroom",
    description:
      "After-work socials, product launches, team activations. We bring the energy your corporate event has been missing — professional, seamless, unforgettable.",
    tag: "Corporate Entertainment",
    cta: "Get in Touch",
    ctaTarget: "contact",
    accent: false,
  },
  {
    number: "04",
    title: "Brand Activations",
    subtitle: "Show Up. Stand Out.",
    description:
      "Put your brand inside the experience. From sponsored stages to immersive brand moments — we integrate your identity into nights people actually remember.",
    tag: "Brand Partnerships",
    cta: "Partner With Us",
    ctaTarget: "contact",
    accent: false,
  },
];

export default function ServicesSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="services"
      className="bg-black py-28 border-t border-white/10"
      data-testid="services-section"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-line" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.3em] font-medium">
            What We Do
          </span>
        </div>

        {/* Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <h2
            className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          >
            MORE THAN
            <br />A NIGHT OUT.
          </h2>
          <p className="text-white/40 text-base leading-relaxed lg:pb-3">
            From island-wide raves to intimate private experiences — After Dark
            Socials curates every kind of night. Whatever the occasion, we bring
            the energy.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
          {services.map((service) => (
            <div
              key={service.number}
              className={`relative p-8 sm:p-10 flex flex-col justify-between group transition-colors duration-300 ${
                service.accent
                  ? "bg-[#c72d28] hover:bg-[#a82421]"
                  : "bg-black hover:bg-[#0a0a0a]"
              }`}
              data-testid={`service-${service.number}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <span
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold ${
                    service.accent ? "text-white/60" : "text-white/20"
                  }`}
                >
                  {service.number}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] border px-3 py-1 ${
                    service.accent
                      ? "border-white/30 text-white/70"
                      : "border-white/10 text-white/30"
                  }`}
                >
                  {service.tag}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <p
                  className={`text-xs uppercase tracking-[0.25em] mb-3 ${
                    service.accent ? "text-white/70" : "text-[#c72d28]"
                  }`}
                >
                  {service.subtitle}
                </p>
                <h3
                  className={`text-4xl sm:text-5xl font-black leading-none mb-6 ${
                    service.accent ? "text-white" : "text-white"
                  }`}
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-10 ${
                    service.accent ? "text-white/70" : "text-white/40"
                  }`}
                >
                  {service.description}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => scrollTo(service.ctaTarget)}
                className={`group/btn inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold transition-colors ${
                  service.accent
                    ? "text-white hover:text-white/70"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {service.cta}
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
