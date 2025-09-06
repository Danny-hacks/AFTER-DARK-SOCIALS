import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import aftrHeroImage from "@assets/AFTR_1757155849539.jpg";

export default function HeroSection() {
  const scrollToTickets = () => {
    const element = document.getElementById('tickets');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-end hero-pattern pt-16">
      {/* Concert crowd background image */}
      <div className="absolute inset-0 bg-black/30"></div>
      <img 
        src={aftrHeroImage} 
        alt="AFTR rave with neon lights and crowd silhouette" 
        className="absolute inset-0 w-full h-full object-contain"
        data-testid="hero-background-image"
      />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-8 border border-white/20" data-testid="event-details-card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center" data-testid="event-date">
              <Calendar className="text-2xl gradient-text mb-2" />
              <div className="text-sm text-gray-300 uppercase tracking-wider">Date</div>
              <div className="text-lg font-semibold text-white">27th September 2025</div>
            </div>
            <div className="flex flex-col items-center" data-testid="event-time">
              <Clock className="text-2xl gradient-text mb-2" />
              <div className="text-sm text-gray-300 uppercase tracking-wider">Time</div>
              <div className="text-lg font-semibold text-white">10:00 PM - 4:00 AM</div>
            </div>
            <div className="flex flex-col items-center" data-testid="event-venue">
              <MapPin className="text-2xl gradient-text mb-2" />
              <div className="text-sm text-gray-300 uppercase tracking-wider">Venue</div>
              <div className="text-lg font-semibold text-white">Shotz, Flic en Flac</div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={scrollToTickets}
          className="inline-flex items-center px-8 py-4 gradient-bg text-white font-bold text-lg rounded-full hover:scale-105 transition-transform pulse-glow"
          data-testid="get-tickets-button"
        >
          <Ticket className="mr-3" />
          Get Your Tickets Now
        </button>
      </div>
    </section>
  );
}
