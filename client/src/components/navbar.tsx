import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiInstagram } from "react-icons/si";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

const navLinks = [
  { label: "About",    href: "/about" },
  { label: "Events",   href: "/events" },
  { label: "ACCESS",   href: "/access" },
  { label: "Gallery",  href: "/gallery" },
  { label: "Services", href: "/services" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black border-b border-white/10" : "bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center" data-testid="nav-logo">
            <img
              src={logoImage}
              alt="After Dark Socials"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                  isActive(link.href) ? "text-white" : "text-white/50 hover:text-white"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="block h-px bg-[#c72d28] mt-1 w-full" />
                )}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/afterdarksocials.mu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              data-testid="nav-instagram-link"
              aria-label="Instagram"
            >
              <SiInstagram className="w-4 h-4" />
            </a>
            <a
              href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-[#c72d28] text-white text-xs uppercase tracking-[0.15em] font-bold hover:bg-[#a82421] transition-colors"
              data-testid="nav-join-link"
            >
              Join Us
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden bg-black border-t border-white/10 py-6"
            data-testid="mobile-menu"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block w-full text-left px-0 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b border-white/5 ${
                  isActive(link.href) ? "text-white" : "text-white/50"
                }`}
                data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-6 px-5 py-3 bg-[#c72d28] text-white text-xs uppercase tracking-[0.15em] font-bold text-center hover:bg-[#a82421] transition-colors"
              data-testid="mobile-nav-join-link"
            >
              Join Us
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
