import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiTiktok } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const enquiryTypes = [
  { value: "", label: "Select enquiry type" },
  { value: "AFTR Event — Tickets / VIP / Table", label: "AFTR Event — Tickets / VIP / Table" },
  { value: "Private Booking",                    label: "Private Booking" },
  { value: "Corporate Event",                    label: "Corporate Event" },
  { value: "Brand Activation",                   label: "Brand Activation" },
  { value: "ACCESS — Exclusive Lounge",          label: "ACCESS — Exclusive Lounge" },
  { value: "General Enquiry",                    label: "General Enquiry" },
];

const contactInfo = [
  {
    icon: SiWhatsapp,
    label: "WhatsApp",
    value: "+230 5820 5220",
    href: "https://wa.me/23058205220",
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+230 5820 5220",
    href: "tel:+23058205220",
    external: false,
  },
  {
    icon: Mail,
    label: "Email",
    value: "afterdarksocials@gmail.com",
    href: "mailto:afterdarksocials@gmail.com",
    external: false,
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "", phone: "", enquiryType: "", eventDate: "", guests: "", message: "",
  });
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.enquiryType) {
      toast({ title: "Please select an enquiry type", variant: "destructive" });
      return;
    }
    const lines = [
      `Hi After Dark Socials!`,
      ``,
      `*Enquiry Type:* ${formData.enquiryType}`,
      `*Name:* ${formData.name}`,
      formData.phone     ? `*Phone:* ${formData.phone}`               : null,
      formData.eventDate ? `*Event Date:* ${formData.eventDate}`       : null,
      formData.guests    ? `*Number of Guests:* ${formData.guests}`    : null,
      ``,
      `*Message:*`,
      formData.message,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/23058205220?text=${encodeURIComponent(lines)}`, "_blank");
    toast({ title: "Opening WhatsApp", description: "Your enquiry is pre-filled and ready to send." });
    setFormData({ name: "", phone: "", enquiryType: "", eventDate: "", guests: "", message: "" });
  };

  const field = "w-full bg-black border-0 border-b border-white/15 text-white placeholder:text-white/20 text-sm px-0 py-3 focus:outline-none focus:border-white/50 transition-colors";
  const label = "block text-[9px] text-white/30 uppercase tracking-[0.3em] mb-2";

  return (
    <section
      id="contact"
      className="bg-black py-20 sm:py-28 border-t border-white/10"
      data-testid="contact-section"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-14 sm:mb-20">
          <span className="section-line" />
          <span className="text-[#c72d28] text-[10px] uppercase tracking-[0.35em] font-medium">Contact</span>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 border-t border-white/10">

          {/* ── LEFT ── */}
          <div className="lg:col-span-5 md:border-r border-white/10 md:pr-8 lg:pr-16 pt-12 sm:pt-16 pb-12 lg:pb-20">

            {/* Heading */}
            <h2
              className="font-black text-white leading-[0.88] tracking-tight mb-10 sm:mb-12"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: "clamp(56px, 13vw, 120px)",
              }}
              data-testid="contact-title"
            >
              GET<br />
              IN<br />
              <span style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)", color: "transparent" }}>
                TOUCH.
              </span>
            </h2>

            <p
              className="text-white/40 leading-[1.8] mb-12 sm:mb-14 max-w-sm"
              style={{ fontSize: "13px" }}
              data-testid="contact-description"
            >
              Book a table, reserve VIP, enquire about private events, or reach
              out about brand activations. We're here to make it happen.
            </p>

            {/* Contact info — bottom border grid */}
            <div className="space-y-0 mb-12 sm:mb-14">
              {contactInfo.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={`group flex items-center justify-between py-4 sm:py-5 border-b border-white/10 hover:border-white/25 transition-colors ${i === 0 ? "border-t border-white/10" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-7 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#c72d28]/40 transition-colors">
                      <item.icon className="w-3 h-3 text-white/30 group-hover:text-[#c72d28] transition-colors" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/25 uppercase tracking-[0.25em] mb-0.5">{item.label}</p>
                      <p className="text-white/60 text-xs font-medium group-hover:text-white transition-colors">{item.value}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>

            {/* Community */}
            <div className="border-t border-white/10 pt-8" data-testid="community-section">
              <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-3">Join the Community</p>
              <p className="text-white/40 text-xs leading-relaxed mb-6">
                Be the first to know about upcoming events and connect with fellow ravers.
              </p>
              <a
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-3 border border-white/15 text-white/50 text-[10px] uppercase tracking-[0.2em] font-bold px-5 py-3 hover:border-white/40 hover:text-white transition-all"
              >
                <SiWhatsapp className="w-3.5 h-3.5" />
                Join WhatsApp Group
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {/* Social */}
            <div className="border-t border-white/10 pt-8 mt-8">
              <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-5">Follow Us</p>
              <div className="flex gap-6">
                <a
                  href="https://www.instagram.com/afterdarksocials.mu"
                  target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.15em] transition-colors"
                  data-testid="instagram-link"
                >
                  <SiInstagram className="w-3.5 h-3.5" />
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@afterdarksocials.mu"
                  target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-white/30 hover:text-white text-[10px] uppercase tracking-[0.15em] transition-colors"
                  data-testid="tiktok-link"
                >
                  <SiTiktok className="w-3.5 h-3.5" />
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form ── */}
          <div
            className="lg:col-span-7 md:pl-8 lg:pl-16 pt-12 sm:pt-16 pb-12 lg:pb-20"
            data-testid="contact-form-card"
          >
            <form onSubmit={handleSubmit} className="space-y-8" data-testid="contact-form">

              {/* Enquiry type */}
              <div>
                <label className={label}>Enquiry Type *</label>
                <select
                  name="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleChange}
                  required
                  className={`${field} cursor-pointer`}
                  style={{
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='rgba(255,255,255,0.25)' d='M5 7L0 2h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0 center",
                  }}
                  data-testid="contact-enquiry-type"
                >
                  {enquiryTypes.map((t) => (
                    <option key={t.value} value={t.value} style={{ background: "#0a0a0a", color: t.value ? "#fff" : "rgba(255,255,255,0.3)" }}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className={label}>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Your full name" required className={field} data-testid="contact-name-input" />
                </div>
                <div>
                  <label className={label}>Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+230 5XXX XXXX" className={field} data-testid="contact-phone-input" />
                </div>
              </div>

              {/* Date + Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className={label}>Event Date</label>
                  <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange}
                    className={`${field} [color-scheme:dark]`} data-testid="contact-date-input" />
                </div>
                <div>
                  <label className={label}>Number of Guests</label>
                  <input type="number" name="guests" value={formData.guests} onChange={handleChange}
                    placeholder="Est. guest count" min="1" className={field} data-testid="contact-guests-input" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={label}>Tell us more *</label>
                <textarea name="message" value={formData.message} onChange={handleChange}
                  rows={5} required
                  placeholder="Describe your event, special requests, or anything else we should know..."
                  className={`${field} resize-none`}
                  data-testid="contact-message-input"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] font-bold px-10 py-4 hover:bg-[#a82421] transition-colors"
                  data-testid="contact-submit-button"
                >
                  <SiWhatsapp className="w-4 h-4" />
                  Send via WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <p className="mt-4 text-[9px] text-white/20 uppercase tracking-[0.2em]">
                  Opens WhatsApp with your enquiry pre-filled
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}