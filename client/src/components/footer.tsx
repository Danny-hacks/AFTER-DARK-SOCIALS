import { SiInstagram } from "react-icons/si";
import logoImage from "@assets/ChatGPT_Image_Jan_4,_2026,_09_11_18_AM_1767514346359.png";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2" data-testid="footer-brand">
            <div className="mb-4">
              <img 
                src={logoImage} 
                alt="After Dark Socials" 
                className="h-20 w-auto"
                data-testid="footer-brand-name"
              />
            </div>
            <p className="text-muted-foreground mb-4" data-testid="footer-description">
              An unforgettable night of music and energy with unmatched vibes 
              and non-stop dancing until dawn.
            </p>
            <div className="flex space-x-4" data-testid="footer-social-links">
              <a 
                href="https://www.instagram.com/afterdarksocials.mu?igsh=M3FxdDR1bzd6MjJy&utm_source=qr" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="footer-instagram"
              >
                <SiInstagram className="text-xl" />
              </a>
            </div>
          </div>
          
          <div data-testid="footer-quick-links">
            <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <button 
                  onClick={() => scrollToSection('event')} 
                  className="hover:text-foreground transition-colors"
                  data-testid="footer-link-event"
                >
                  Event Info
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('tickets')} 
                  className="hover:text-foreground transition-colors"
                  data-testid="footer-link-tickets"
                >
                  Tickets
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('location')} 
                  className="hover:text-foreground transition-colors"
                  data-testid="footer-link-location"
                >
                  Location
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="hover:text-foreground transition-colors"
                  data-testid="footer-link-contact"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div data-testid="footer-legal-links">
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="footer-terms">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="footer-privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="footer-refund">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="footer-age">
                  Age Requirements
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground" data-testid="footer-copyright">
          <p>&copy; 2025 AFTR. All rights reserved. The rave that keeps the city awake.</p>
        </div>
      </div>
    </footer>
  );
}
