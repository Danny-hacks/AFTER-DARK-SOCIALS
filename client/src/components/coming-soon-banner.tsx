import { SiWhatsapp } from "react-icons/si";
import comingSoonImage from "@assets/AFTR_black_white_1766249732057.jpg";

export default function ComingSoonBanner() {
  return (
    <section className="relative" data-testid="coming-soon-section">
      <div className="relative w-full">
        <img 
          src={comingSoonImage} 
          alt="AFTR Coming Soon" 
          className="w-full h-auto object-cover"
          data-testid="coming-soon-image"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 gradient-bg text-white font-bold rounded-full hover:scale-105 transition-transform text-lg"
                data-testid="coming-soon-cta"
              >
                <SiWhatsapp className="text-xl" />
                Join AFTR Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
