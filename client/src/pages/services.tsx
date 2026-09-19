import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { Link } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";
import { Reveal } from "@/components/reveal";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { AccessEvent } from "@shared/schema";

const R2 = "https://pub-0b879285061a49e498441ce2f868eb74.r2.dev/homepage%20pictures";
// Same banner fallback used on the ACCESS page itself, so this panel always
// matches whatever's currently live there.
const DEFAULT_ACCESS_BANNER_URL = `${R2}/Serge_59.jpg`;
// One of the "Past Editions" gallery photos from the ACCESS page.
const PRIVATE_BOOKINGS_IMAGE = `${R2}/Serge_70.jpg`;

// ─── Service data ─────────────────────────────────────────────────────────────
const services = [
  {
    number: "01",
    title: "Private Bookings",
    tag: "Bespoke Experiences",
    description:
      "Birthday parties, private celebrations, intimate gatherings. We handle the curation, the DJs, the atmosphere — you just show up.",
    pullQuote: "YOUR NIGHT. OUR CRAFT.",
    specs: [
      { label: "Capacity", value: "20 — 500+ guests" },
      { label: "Setup",    value: "Full DJ rig, sound, lighting" },
      { label: "Genres",   value: "Afrobeats, Amapiano, R&B, House" },
      { label: "Duration", value: "Flexible — from 3hr to all night" },
    ],
    ctaLabel: "Enquire Now",
    ctaHref: "#enquire",
    flip: false,
  },
  {
    number: "02",
    title: "Corporate Events",
    tag: "Corporate Entertainment",
    description:
      "After-work socials, product launches, team activations. We bring the energy your corporate event has been missing — professional, seamless, unforgettable.",
    pullQuote: "BEYOND THE BOARDROOM.",
    specs: [
      { label: "Format",   value: "After-work, launch, activation" },
      { label: "Branding", value: "Full custom integration" },
      { label: "AV",       value: "Professional sound + lighting" },
      { label: "Crowd",    value: "Curated to your demographic" },
    ],
    ctaLabel: "Get in Touch",
    ctaHref: "#enquire",
    flip: true,
  },
  {
    number: "03",
    title: "Brand Activations",
    tag: "Brand Partnerships",
    description:
      "Put your brand inside the experience. From sponsored stages to immersive brand moments — we integrate your identity into nights people actually remember.",
    pullQuote: "SHOW UP. STAND OUT.",
    specs: [
      { label: "Format",  value: "Sponsored stage, experiential zone" },
      { label: "Content", value: "Social media creation during event" },
      { label: "Reach",   value: "Mauritius nightlife audience" },
      { label: "Fit",     value: "AFMR, lifestyle, fashion, F&B" },
    ],
    ctaLabel: "Partner With Us",
    ctaHref: "#enquire",
    flip: false,
  },
  {
    number: "04",
    title: "ACCESS",
    tag: "Private Social",
    description:
      "A private social night for the people who want more than a rave. Curated guest list, reserved seating, premium experience. Not everyone gets in.",
    pullQuote: "NOT EVERYONE GETS ACCESS.",
    specs: [
      { label: "Format",   value: "Table-based private social" },
      { label: "Capacity", value: "Limited — by invite or RSVP only" },
      { label: "Seating",  value: "Private tables from 4 to 12+" },
      { label: "Extras",   value: "Priority bar, exclusive zone" },
    ],
    ctaLabel: "RSVP ACCESS",
    ctaHref: "/access",
    ctaAccent: "gold",
    flip: true,
  },
];

const processSteps = [
  { step: "01", title: "Brief", desc: "Tell us the occasion, vibe, and guest count. We handle everything else from there." },
  { step: "02", title: "Proposal", desc: "We put together a custom proposal — lineup, venue, timeline, and pricing. Within 48 hours." },
  { step: "03", title: "Confirm", desc: "Approve the plan, lock the date, and pay the deposit. Your night is secured." },
  { step: "04", title: "The Night", desc: "Show up. We've handled every detail — sound, DJs, vibe. All you do is enjoy it." },
];

// ─── Enquiry form ─────────────────────────────────────────────────────────────
function EnquiryForm() {
  const [form, setForm] = useState({
    service: "", name: "", email: "", phone: "", date: "", guests: "", message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = [
      `*Service Enquiry — AFTR*`,
      ``,
      `*Service:* ${form.service}`,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      `*Phone:* ${form.phone}`,
      `*Date:* ${form.date}`,
      `*Guests:* ${form.guests}`,
      `*Message:* ${form.message}`,
    ].join("\n");
    window.open(`https://wa.me/23058205220?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const inputCls = "w-full bg-transparent border-b border-white/15 text-white placeholder:text-white/20 text-sm px-0 py-3 focus:outline-none focus:border-white/45 transition-colors";
  const labelCls = "block text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2";

  const serviceOptions = [
    "Private Booking", "Corporate Event", "Brand Activation", "ACCESS Table",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label htmlFor="svc-service" className={labelCls}>Service *</label>
        <select
          id="svc-service"
          required
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className={`${inputCls} bg-black cursor-pointer`}
          style={{ appearance: "none" }}
        >
          <option value="" style={{ background: "#0a0a0a" }}>Select a service</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s} style={{ background: "#0a0a0a" }}>{s}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
        <div>
          <label htmlFor="svc-name" className={labelCls}>Name *</label>
          <input id="svc-name" required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="svc-email" className={labelCls}>Email *</label>
          <input id="svc-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
        <div>
          <label htmlFor="svc-phone" className={labelCls}>Phone / WhatsApp *</label>
          <input id="svc-phone" required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+230 5XXX XXXX" className={inputCls} />
        </div>
        <div>
          <label htmlFor="svc-date" className={labelCls}>Event Date</label>
          <input id="svc-date" type="text" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="e.g. Aug 2026" className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="svc-guests" className={labelCls}>Expected Guests</label>
        <input id="svc-guests" type="text" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} placeholder="e.g. 50–80" className={inputCls} />
      </div>
      <div>
        <label htmlFor="svc-message" className={labelCls}>Message</label>
        <textarea id="svc-message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you have in mind..." className={`${inputCls} resize-none`} />
      </div>
      <button
        type="submit"
        className="group inline-flex items-center gap-3 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:bg-[#a82421] transition-colors"
      >
        <SiWhatsapp className="w-3.5 h-3.5" />
        Send via WhatsApp
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  usePageTitle("Services");

  const { data: accessData } = useQuery<{ success: boolean; event: AccessEvent | null }>({
    queryKey: ["/api/access/current"],
  });
  const accessBannerUrl = accessData?.event?.bannerUrl || DEFAULT_ACCESS_BANNER_URL;

  const panelImages: Record<string, string> = {
    "Private Bookings": PRIVATE_BOOKINGS_IMAGE,
    "ACCESS": accessBannerUrl,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-32 sm:pt-40 pb-16 sm:pb-20 border-b border-white/10">
        <div className="flex items-center gap-4 mb-14">
          <span className="w-8 h-px bg-[#c72d28]" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">What We Do</span>
        </div>
        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          <h1
            className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px, 8vw, 100px)" }}
          >
            WE CURATE
            <br />
            EVERY KIND
            <br />
            <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
              OF NIGHT.
            </span>
          </h1>
          <div className="lg:pb-2">
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              From island-wide raves to intimate private experiences — After Dark Socials curates every kind of night. Whatever the occasion, we bring the energy.
            </p>
            <a
              href="#enquire"
              className="group inline-flex items-center gap-3 border border-white/20 text-white/60 text-[10px] uppercase tracking-[0.25em] font-bold px-8 py-4 hover:border-white/50 hover:text-white transition-all"
            >
              Get in Touch
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>

      {/* ── Services alternating ──────────────────────────────────────────── */}
      {services.map((svc) => {
        const panelImage = panelImages[svc.title];
        return (
        <Reveal key={svc.number} className="border-b border-white/10">
          <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 ${svc.flip ? "lg:[direction:rtl]" : ""}`}>
            {/* Content */}
            <div className={`px-5 sm:px-6 lg:px-12 py-16 sm:py-20 flex flex-col justify-center ${svc.flip ? "lg:[direction:ltr]" : ""}`}>
              <div className="flex items-center gap-4 mb-10">
                <span className="text-white/15 font-black" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "14px" }}>
                  {svc.number}
                </span>
                <span className="w-6 h-px bg-white/15" />
                <span className="text-white/30 text-[9px] uppercase tracking-[0.3em]">{svc.tag}</span>
              </div>
              <h2
                className="font-black text-white leading-none mb-5"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px, 6vw, 72px)" }}
              >
                {svc.title.toUpperCase()}
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-lg">{svc.description}</p>

              {/* Spec rows */}
              <div className="border-t border-white/10 mb-8">
                {svc.specs.map((spec) => (
                  <div key={spec.label} className="flex items-start justify-between border-b border-white/10 py-3 gap-4">
                    <span className="text-white/25 text-[10px] uppercase tracking-[0.2em] shrink-0">{spec.label}</span>
                    <span className="text-white/60 text-xs text-right">{spec.value}</span>
                  </div>
                ))}
              </div>

              <Link
                href={svc.ctaHref}
                className={`group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold px-8 py-4 transition-colors w-fit ${
                  svc.ctaAccent === "gold"
                    ? "bg-[#c9962a] text-black hover:bg-[#b8860b]"
                    : "bg-[#c72d28] text-white hover:bg-[#a82421]"
                }`}
              >
                {svc.ctaLabel}
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Visual panel */}
            <div className={`relative bg-[#080808] flex flex-col items-center justify-center min-h-[280px] lg:min-h-0 overflow-hidden border-t lg:border-t-0 border-white/10 ${svc.flip ? "lg:border-r lg:[direction:ltr]" : "lg:border-l"}`}>
              {panelImage ? (
                <>
                  <img src={panelImage} alt={svc.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
              )}
              <div className="relative px-10 sm:px-14 text-center">
                <p
                  className="font-black text-white leading-tight"
                  style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "clamp(28px, 4vw, 48px)",
                    WebkitTextStroke: "1px rgba(255,255,255,0.3)",
                    color: "transparent",
                  }}
                >
                  {svc.pullQuote}
                </p>
              </div>
              {/* Corner accent */}
              <div className="absolute bottom-6 right-6">
                <span className="text-[#c72d28] text-[9px] uppercase tracking-[0.4em] opacity-50">{svc.number}</span>
              </div>
            </div>
          </div>
        </Reveal>
        );
      })}

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
          <Reveal>
            <div className="flex items-center gap-4 mb-14">
              <span className="w-8 h-px bg-[#c72d28]" />
              <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">How It Works</span>
            </div>
            <h2
              className="font-black text-white leading-none mb-16"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px, 6vw, 80px)" }}
            >
              FROM BRIEF
              <br />
              <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
                TO NIGHT.
              </span>
            </h2>
          </Reveal>

          {/* Desktop horizontal timeline */}
          <div className="hidden lg:grid grid-cols-4 relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-[#c72d28]/30" />
            {processSteps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-start pt-0 pr-12">
                {/* Dot */}
                <div className="relative z-10 w-10 h-10 border border-[#c72d28]/40 flex items-center justify-center mb-6 bg-black">
                  <span
                    className="text-[#c72d28] font-black"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "14px" }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3
                  className="text-white font-black leading-none mb-3"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "28px" }}
                >
                  {s.title.toUpperCase()}
                </h3>
                <p className="text-white/35 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile stacked */}
          <div className="lg:hidden space-y-10">
            {processSteps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="w-8 h-8 border border-[#c72d28]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#c72d28] text-[11px] font-bold">{s.step}</span>
                </div>
                <div>
                  <h3
                    className="text-white font-black leading-none mb-2"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "24px" }}
                  >
                    {s.title.toUpperCase()}
                  </h3>
                  <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Enquiry ───────────────────────────────────────────────────────── */}
      <div id="enquire">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left — heading + contacts */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <span className="w-8 h-px bg-[#c72d28]" />
                <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em]">Get In Touch</span>
              </div>
              <h2
                className="font-black text-white leading-none mb-6"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px, 6vw, 72px)" }}
              >
                LET'S MAKE
                <br />SOMETHING
                <br />
                <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
                  HAPPEN.
                </span>
              </h2>
              <p className="text-white/35 text-sm leading-relaxed mb-12 max-w-sm">
                Send us the form and we'll come back within 24 hours. Or reach us directly via WhatsApp.
              </p>

              <div className="space-y-6">
                <a
                  href="https://wa.me/23058205220"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-9 h-9 border border-white/10 flex items-center justify-center group-hover:border-[#25D366]/40 transition-colors">
                    <SiWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/25 uppercase tracking-[0.25em] mb-0.5">WhatsApp</p>
                    <p className="text-white/60 text-sm group-hover:text-white transition-colors">+230 5820 5220</p>
                  </div>
                </a>
                <a
                  href="mailto:afterdarksocials@gmail.com"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-9 h-9 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                    <span className="text-white/40 text-xs font-bold">@</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/25 uppercase tracking-[0.25em] mb-0.5">Email</p>
                    <p className="text-white/60 text-sm group-hover:text-white transition-colors">afterdarksocials@gmail.com</p>
                  </div>
                </a>
                <a
                  href="https://instagram.com/afterdarksocials_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-9 h-9 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                    <SiInstagram className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/25 uppercase tracking-[0.25em] mb-0.5">Instagram</p>
                    <p className="text-white/60 text-sm group-hover:text-white transition-colors">@afterdarksocials_</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right — form */}
            <EnquiryForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
