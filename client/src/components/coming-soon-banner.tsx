import { SiWhatsapp } from "react-icons/si";
import { Calendar, MapPin, Clock } from "lucide-react";
import comingSoonImage from "@assets/AFTR_black_white_1766249732057.jpg";

export default function ComingSoonBanner() {
  return (
    <section id="coming-soon" className="py-20 bg-gradient-to-b from-background via-card to-background" data-testid="coming-soon-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="coming-soon-title">
            Coming Soon
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="coming-soon-description">
            The next chapter of AFTR is almost here
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden" data-testid="coming-soon-card">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold" data-testid="coming-soon-badge">
                COMING SOON
              </span>
            </div>
            
            <img 
              src={comingSoonImage} 
              alt="AFTR Vol.2 Coming Soon" 
              className="w-full h-80 sm:h-[500px] object-cover object-center"
              data-testid="coming-soon-image"
            />
          </div>
          
          <div className="p-6 sm:p-8">
            <h3 className="text-3xl font-bold gradient-text mb-4" data-testid="coming-soon-event-title">
              AFTR Vol.2: The Return
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="coming-soon-date">
                <Calendar className="text-primary" />
                <span>Date TBA</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="coming-soon-time">
                <Clock className="text-primary" />
                <span>Time TBA</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="coming-soon-venue">
                <MapPin className="text-primary" />
                <span>Venue TBA</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-8" data-testid="coming-soon-text">
              Get ready for the next edition of the rave that keeps the city awake. 
              Join our community to be the first to know when tickets drop.
            </p>

            <div className="flex justify-center">
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
