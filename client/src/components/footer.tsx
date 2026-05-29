import { SiInstagram, SiWhatsapp, SiTiktok } from "react-icons/si";
import { Link } from "wouter";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="bg-black border-t border-white/10 py-16"
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
          {/* Brand */}
          <div data-testid="footer-brand">
            <img
              src={logoImage}
              alt="After Dark Socials"
              className="h-14 w-auto mb-6 opacity-80"
              data-testid="footer-brand-name"
            />
            <p
              className="text-white/30 text-sm leading-relaxed max-w-xs"
              data-testid="footer-description"
            >
              An unforgettable night of music and energy with unmatched vibes
              and non-stop dancing until dawn.
            </p>
            <div className="flex gap-4 mt-6" data-testid="footer-social-links">
              <a
                href="https://www.instagram.com/afterdarksocials.mu?igsh=M3FxdDR1bzd6MjJy&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors"
                data-testid="footer-instagram"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@afterdarksocials.mu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors"
                data-testid="footer-tiktok"
              >
                <SiTiktok className="w-4 h-4" />
              </a>
              <a
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors"
                data-testid="footer-whatsapp"
              >
                <SiWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="footer-quick-links">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-6">
              Navigate
            </p>
            <ul className="space-y-3">
              {[
                { label: "About", id: "about" },
                { label: "Services", id: "services" },
                { label: "ACCESS", id: "access" },
                { label: "Past Events", id: "past-events" },
                { label: "Contact", id: "contact" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-white/30 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/gallery"
                  className="text-white/30 hover:text-white text-sm transition-colors"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div data-testid="footer-legal-links">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-6">
              Legal
            </p>
            <ul className="space-y-3">
              {[
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Refund Policy", href: "/refund" },
                { label: "Age Requirements", href: "/age-requirements" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/30 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          data-testid="footer-copyright"
        >
          <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
            &copy; 2026 AFTR. All rights reserved.
          </p>
          <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
            The rave that keeps the city awake.
          </p>
        </div>
      </div>
    </footer>
  );
}
