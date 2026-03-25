import { useState } from "react";
import { Phone, Mail } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi! I have a question about AFTR events.");
    window.open(`https://web.whatsapp.com/send?phone=23058205220&text=${message}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("AFTR Events - Inquiry");
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.open(`mailto:afterdarksocials@gmail.com?subject=${subject}&body=${body}`, '_blank');
    toast({ title: "Message Prepared", description: "Your email client should open with the pre-filled message." });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="bg-black py-28 border-t border-white/10" data-testid="contact-section">
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

            <p className="text-white/40 text-sm mb-12" data-testid="contact-description">
              Questions about upcoming events? We're here to help.
            </p>

            <div className="space-y-6 mb-12">
              <button
                onClick={openWhatsApp}
                className="flex items-center gap-4 group text-white/50 hover:text-white transition-colors"
                data-testid="whatsapp-contact"
              >
                <SiWhatsapp className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-0.5">WhatsApp</div>
                  <div className="text-sm font-medium" data-testid="whatsapp-link">58205220</div>
                </div>
              </button>

              <div className="flex items-center gap-4" data-testid="phone-contact">
                <Phone className="w-5 h-5 text-[#c72d28] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-0.5">Phone</div>
                  <a href="tel:+23058205220" className="text-sm font-medium text-white/50 hover:text-white transition-colors" data-testid="phone-link">
                    58205220
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4" data-testid="email-contact">
                <Mail className="w-5 h-5 text-[#c72d28] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-0.5">Email</div>
                  <a href="mailto:afterdarksocials@gmail.com" className="text-sm font-medium text-white/50 hover:text-white transition-colors" data-testid="email-link">
                    afterdarksocials@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Community CTA */}
            <div className="border border-white/10 p-6" data-testid="community-section">
              <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-4" data-testid="community-title">
                Join the Community
              </p>
              <p className="text-white/50 text-sm mb-6">
                Be the first to know about upcoming events and connect with fellow ravers.
              </p>
              <a
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white text-xs uppercase tracking-[0.15em] font-bold px-6 py-3 hover:bg-[#1da851] transition-colors"
                data-testid="join-community-button"
              >
                <SiWhatsapp className="w-4 h-4" />
                Join WhatsApp Group
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div data-testid="contact-form-card">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="contact-name-input"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors"
                  data-testid="contact-email-input"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="How can we help you?"
                  required
                  className="w-full bg-transparent border border-white/15 text-white placeholder:text-white/20 text-sm px-4 py-3 focus:outline-none focus:border-white/40 transition-colors resize-none"
                  data-testid="contact-message-input"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black text-xs uppercase tracking-[0.2em] font-bold py-4 hover:bg-[#c72d28] hover:text-white transition-colors"
                data-testid="contact-submit-button"
              >
                Send Message
              </button>
            </form>

            {/* Social links */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-5" data-testid="social-media-title">
                Follow Us
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="https://www.instagram.com/afterdarksocials.mu?igsh=M3FxdDR1bzd6MjJy&utm_source=qr"
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
