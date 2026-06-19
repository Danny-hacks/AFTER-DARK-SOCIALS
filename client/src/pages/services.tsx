import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const services = [
  {
    number: "01",
    title: "AFTR Events",
    subtitle: "Rave Series",
    description:
      "Our flagship rave series. Curated lineups, pulsating energy, and nights that Mauritius won't forget. Tickets, tables, and VIP available for every volume.",
    details: [
      "Hand-picked DJ lineups spanning Amapiano, Afrobeats, Hip Hop, House",
      "Premium venue partnerships across Mauritius",
      "Ticket tiers: General Entry, Table, VIP ACCESS",
      "6+ hours of non-stop music, 10PM to 4AM",
    ],
    tag: "Ticketing & Bookings",
    ctaLabel: "View Past Events",
    ctaHref: "/events/past",
    accent: true,
  },
  {
    number: "02",
    title: "Private Bookings",
    subtitle: "Your Night, Your Way",
    description:
      "Birthday parties, private celebrations, intimate gatherings. We handle the curation, the DJs, the atmosphere — you just show up.",
    details: [
      "Bespoke DJ selection from our curated roster",
      "Venue sourcing and setup coordination",
      "Custom playlists and genre curation",
      "Flexible guest capacities — from 20 to 500+",
    ],
    tag: "Bespoke Experiences",
    ctaLabel: "Enquire Now",
    ctaHref: "/contact",
    accent: false,
  },
  {
    number: "03",
    title: "Corporate Events",
    subtitle: "Beyond the Boardroom",
    description:
      "After-work socials, product launches, team activations. We bring the energy your corporate event has been missing — professional, seamless, unforgettable.",
    details: [
      "Custom branding integration throughout the event",
      "Professional event management and coordination",
      "DJ sets tailored to corporate crowd demographics",
      "Full AV, lighting, and sound production",
    ],
    tag: "Corporate Entertainment",
    ctaLabel: "Get in Touch",
    ctaHref: "/contact",
    accent: false,
  },
  {
    number: "04",
    title: "Brand Activations",
    subtitle: "Show Up. Stand Out.",
    description:
      "Put your brand inside the experience. From sponsored stages to immersive brand moments — we integrate your identity into nights people actually remember.",
    details: [
      "Sponsored stage and DJ set opportunities",
      "Branded experiential zones within the venue",
      "Social media content creation during events",
      "Audience reach across Mauritius' nightlife community",
    ],
    tag: "Brand Partnerships",
    ctaLabel: "Partner With Us",
    ctaHref: "/contact",
    accent: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-20 sm:pb-28">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-14">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">What We Do</span>
        </div>

        {/* Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end border-b border-white/10 pb-16 sm:pb-20">
          <h1
            className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(56px, 9vw, 120px)" }}
          >
            MORE THAN
            <br />A NIGHT OUT.
          </h1>
          <p className="text-white/40 text-sm leading-relaxed lg:pb-3">
            From island-wide raves to intimate private experiences — After Dark Socials curates every kind of night. Whatever the occasion, we bring the energy.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 mb-20">
          {services.map((service) => (
            <div
              key={service.number}
              className={`relative p-8 sm:p-10 flex flex-col justify-between group transition-colors duration-300 ${
                service.accent ? "bg-[#c72d28] hover:bg-[#a82421]" : "bg-black hover:bg-[#0a0a0a]"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${service.accent ? "text-white/60" : "text-white/20"}`}>
                  {service.number}
                </span>
                <span className={`text-[10px] uppercase tracking-[0.2em] border px-3 py-1 ${service.accent ? "border-white/30 text-white/70" : "border-white/10 text-white/30"}`}>
                  {service.tag}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-[0.25em] mb-3 ${service.accent ? "text-white/70" : "text-[#c72d28]"}`}>
                  {service.subtitle}
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-black leading-none mb-6 text-white"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  {service.title}
                </h2>
                <p className={`text-sm leading-relaxed mb-8 ${service.accent ? "text-white/70" : "text-white/40"}`}>
                  {service.description}
                </p>

                {/* Detail bullets */}
                <ul className="space-y-2 mb-10">
                  {service.details.map((d) => (
                    <li key={d} className={`flex items-start gap-3 text-xs leading-relaxed ${service.accent ? "text-white/50" : "text-white/25"}`}>
                      <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${service.accent ? "bg-white/40" : "bg-white/20"}`} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                href={service.ctaHref}
                className={`group/btn inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-bold transition-colors ${
                  service.accent ? "text-white hover:text-white/70" : "text-white/40 hover:text-white"
                }`}
              >
                {service.ctaLabel}
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-white/10 pt-16 flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-1">
            <h3
              className="text-white font-black leading-none mb-3"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(32px, 4vw, 48px)" }}
            >
              READY TO MAKE IT HAPPEN?
            </h3>
            <p className="text-white/30 text-sm leading-relaxed max-w-md">
              Whether it's a rave, a private function, or a corporate activation — reach out and we'll make it unforgettable.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#a82421] transition-colors whitespace-nowrap"
          >
            Get in Touch
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
