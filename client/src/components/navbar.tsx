import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = ['about', 'coming-soon', 'past-events', 'contact'];
      let currentSection = '';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Next Event', id: 'coming-soon' },
    { label: 'Past Events', id: 'past-events' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black border-b border-white/10' : 'bg-transparent'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center"
            data-testid="nav-logo"
          >
            <img src={logoImage} alt="After Dark Socials" className="h-10 sm:h-12 w-auto" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                  activeSection === link.id ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
                data-testid={`nav-link-${link.id}`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="block h-px bg-[#c72d28] mt-1 w-full" />
                )}
              </button>
            ))}
            <Link
              href="/gallery"
              className="text-xs uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white transition-colors"
              data-testid="nav-link-gallery"
            >
              Gallery
            </Link>
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

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 py-6" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`block w-full text-left px-0 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b border-white/5 ${
                  activeSection === link.id ? 'text-white' : 'text-white/50'
                }`}
                data-testid={`mobile-nav-link-${link.id}`}
              >
                {link.label}
              </button>
            ))}
            <Link
              href="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left px-0 py-3 text-xs uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white border-b border-white/5 transition-colors"
              data-testid="mobile-nav-link-gallery"
            >
              Gallery
            </Link>
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
