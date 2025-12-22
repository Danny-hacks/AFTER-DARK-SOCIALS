import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logoImage from "@assets/ChatGPT_Image_Dec_22,_2025,_08_25_03_AM_1766388371283.png";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Determine active section based on scroll position
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
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Coming Soon', id: 'coming-soon' },
    { label: 'Past Events', id: 'past-events' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      data-testid="navbar"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center"
            data-testid="nav-logo"
          >
            <img 
              src={logoImage} 
              alt="After Dark Socials" 
              className="h-16 sm:h-20 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`transition-colors text-sm uppercase tracking-wider font-medium relative py-1 ${
                  activeSection === link.id 
                    ? 'text-[#c72d28]' 
                    : 'text-white/80 hover:text-white'
                }`}
                data-testid={`nav-link-${link.id}`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#c72d28] rounded-full" />
                )}
              </button>
            ))}
            <a 
              href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-[#c72d28] text-white text-sm uppercase tracking-wider font-medium rounded-full hover:bg-[#a82421] transition-colors"
              data-testid="nav-join-link"
            >
              Join Us
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10 py-4" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`block w-full text-left px-4 py-3 hover:bg-white/5 transition-colors text-sm uppercase tracking-wider ${
                  activeSection === link.id 
                    ? 'text-[#c72d28] border-l-2 border-[#c72d28]' 
                    : 'text-white/80 hover:text-white'
                }`}
                data-testid={`mobile-nav-link-${link.id}`}
              >
                {link.label}
              </button>
            ))}
            <a 
              href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
              target="_blank"
              rel="noopener noreferrer"
              className="block mx-4 mt-4 px-5 py-3 bg-[#c72d28] text-white text-sm uppercase tracking-wider font-medium rounded-full text-center hover:bg-[#a82421] transition-colors"
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
