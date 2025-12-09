import { Calendar, MapPin, Music } from "lucide-react";
import aftrHeroImage from "@assets/AFTR_1757155849539.jpg";

export default function HeroSection() {
  const scrollToEvents = () => {
    const element = document.getElementById('past-events');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center hero-pattern">
      {/* Concert crowd background image */}
      <div className="absolute inset-0 bg-black/50"></div>
      <img 
        src={aftrHeroImage} 
        alt="AFTR rave with neon lights and crowd silhouette" 
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ objectPosition: 'center center' }}
        data-testid="hero-background-image"
      />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-6xl sm:text-8xl font-black gradient-text mb-4 tracking-wider" data-testid="brand-title">
          AFTR
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 font-light" data-testid="brand-tagline">
          The Rave That Keeps The City Awake
        </p>
        
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 mb-8 border border-white/20 max-w-2xl mx-auto" data-testid="brand-info-card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center" data-testid="brand-music">
              <Music className="text-2xl sm:text-3xl gradient-text mb-2" />
              <div className="text-sm sm:text-base font-semibold text-white">Underground Vibes</div>
            </div>
            <div className="flex flex-col items-center" data-testid="brand-location">
              <MapPin className="text-2xl sm:text-3xl gradient-text mb-2" />
              <div className="text-sm sm:text-base font-semibold text-white">Mauritius</div>
            </div>
            <div className="flex flex-col items-center" data-testid="brand-events">
              <Calendar className="text-2xl sm:text-3xl gradient-text mb-2" />
              <div className="text-sm sm:text-base font-semibold text-white">Epic Events</div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={scrollToEvents}
          className="inline-flex items-center px-8 py-4 gradient-bg text-white font-bold text-lg rounded-full hover:scale-105 transition-transform pulse-glow"
          data-testid="view-events-button"
        >
          View Our Events
        </button>
      </div>
    </section>
  );
}
