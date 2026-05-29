import { Phone, Mail } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiTiktok } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const enquiryTypes = [
  { value: "", label: "Select enquiry type" },
  { value: "AFTR Event — Tickets / VIP / Table", label: "AFTR Event — Tickets / VIP / Table" },
  { value: "Private Booking", label: "Private Booking" },
  { value: "Corporate Event", label: "Corporate Event" },
  { value: "Brand Activation", label: "Brand Activation" },
  { value: "ACCESS — Exclusive Lounge", label: "ACCESS — Exclusive Lounge" },
  { value: "General Enquiry", label: "General Enquiry" },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    enquiryType: "",
    eventDate: "",
    guests: "",
    message: "",
  });
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.enquiryType) {
      toast({ title: "Please select an enquiry type", variant: "destructive" });
      return;
    }

    const lines = [
      `Hi After Dark Socials! 👋`,
      ``,
      `*Enquiry Type:* ${formData.enquiryType}`,
      `*Name:* ${formData.name}`,
      formData.phone ? `*Phone:* ${formData.phone}` : null,
      formData.eventDate ? `*Event Date:* ${formData.eventDate}` : null,
      formData.guests ? `*Number of Guests:* ${formData.guests}` : null,
      ``,
      `*Message:*`,
      formData.message,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const encoded = encodeURIComponent(lines);
    window.open(`https://wa.me/23058205220?text=${encoded}`, "_blank");

    toast({
      title: "Opening WhatsApp",
      description: "Your enquiry is pre-filled and ready to send.",
    });

    setFormData({
      name: "",
      phone: "",
      enquiryType: "",
      eventDate: "",
      guests: "",
      message: "",
    });
  };

  const inputClass =
    "w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors";
  const labelClass =
    "block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3";

  return (
    <section
      id="contact"
      className="bg-black py-28 border-t border-white/10"
      data-testid="contact-section"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-line" />
          <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em] font-medium">
            Contact
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Heading + info */}
          <div>
            <h2
              className="text-6xl sm:text-7xl font-black text-white leading-none mb-12"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              data-testid="contact-title"
            >
              GET<br />IN TOUCH.
            </h2>

            <p
              className="text-white/40 text-sm mb-12"
              data-testid="contact-description"
            >
              Book a table, reserve VIP, enquire about private events, or reach
              out about brand activations. We're here to make it happen.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <SiWhatsapp className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-0.5">
                    WhatsApp
                  </div>
                  <a
                    href="https://wa.me/23058205220"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                  >
                    +230 5820 5220
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#c72d28] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-0.5">
                    Phone
                  </div>
                  <a
                    href="tel:+23058205220"
                    className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                  >
                    +230 5820 5220
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#c72d28] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-0.5">
                    Email
                  </div>
                  <a
                    href="mailto:afterdarksocials@gmail.com"
                    className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                  >
                    afterdarksocials@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Community CTA */}
            <div
              className="border border-white/10 p-6"
              data-testid="community-section"
            >
              <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4">
                Join the Community
              </p>
              <p className="text-white/50 text-sm mb-6">
                Be the first to know about upcoming events and connect with
                fellow ravers.
              </p>
              <a
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white text-xs uppercase tracking-[0.15em] font-bold px-6 py-3 hover:bg-[#1da851] transition-colors"
              >
                <SiWhatsapp className="w-4 h-4" />
                Join WhatsApp Group
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div data-testid="contact-form-card">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              data-testid="contact-form"
            >
              {/* Enquiry Type */}
              <div>
                <label className={labelClass}>Enquiry Type *</label>
                <select
                  name="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleInputChange}
                  required
                  className={`${inputClass} cursor-pointer`}
                  style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.3)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
                  data-testid="contact-enquiry-type"
                >
                  {enquiryTypes.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      style={{ background: "#111", color: t.value ? "#fff" : "rgba(255,255,255,0.3)" }}
                    >
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                    className={inputClass}
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+230 5XXX XXXX"
                    className={inputClass}
                    data-testid="contact-phone-input"
                  />
                </div>
              </div>

              {/* Event Date + Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className={`${inputClass} [color-scheme:dark]`}
                    data-testid="contact-date-input"
                  />
                </div>
                <div>
                  <label className={labelClass}>Number of Guests</label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    placeholder="Est. guest count"
                    min="1"
                    className={inputClass}
                    data-testid="contact-guests-input"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={labelClass}>Tell us more</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Describe your event, special requests, or anything else we should know..."
                  required
                  className={`${inputClass} resize-none`}
                  data-testid="contact-message-input"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white text-xs uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#1da851] transition-colors"
                data-testid="contact-submit-button"
              >
                <SiWhatsapp className="w-4 h-4" />
                Send via WhatsApp
              </button>

              <p className="text-[10px] text-white/20 text-center tracking-[0.15em] uppercase">
                Opens WhatsApp with your enquiry pre-filled
              </p>
            </form>

            {/* Social links */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5">
                Follow Us
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="https://www.instagram.com/afterdarksocials.mu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-white/30 hover:text-white text-xs transition-colors"
                  data-testid="instagram-link"
                >
                  <SiInstagram className="w-4 h-4" />
                  @afterdarksocials.mu
                </a>
                <a
                  href="https://www.tiktok.com/@afterdarksocials.mu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-white/30 hover:text-white text-xs transition-colors"
                  data-testid="tiktok-link"
                >
                  <SiTiktok className="w-4 h-4" />
                  @afterdarksocials.mu
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}