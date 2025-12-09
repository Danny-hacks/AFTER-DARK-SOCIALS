import { Calendar, MapPin, Clock, Users, CheckCircle } from "lucide-react";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djLuvleshImage from "@assets/DJ LUVLESH_1757156832389.jpg";
import djStevoImage from "@assets/STEVOTHEDJ_1757156832391.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";

const artists = [
  { name: "DJ ALVIN", genre: "Hip Hop", image: djAlvinImage },
  { name: "DJ LUVLESH", genre: "Amapiano", image: djLuvleshImage },
  { name: "STEVOTHEDJ", genre: "Afrobeats & Dancehall", image: djStevoImage },
  { name: "DJ SWAY", genre: "Afrohouse & Amapiano", image: djSwayImage },
  { name: "DJ AFROKEYZ", genre: "Amapiano & 3 Steps", image: djAfrokeyzImage },
];

export default function PastEvents() {
  return (
    <section id="past-events" className="py-20 bg-gradient-to-b from-background via-card to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="past-events-title">
            Past Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="past-events-description">
            Relive the unforgettable nights that made AFTR legendary
          </p>
        </div>

        {/* AFTR September 2025 Event */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-12" data-testid="past-event-card">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-bold" data-testid="past-event-badge">
                PAST EVENT
              </span>
            </div>
            <img 
              src={aftrEventImage} 
              alt="AFTR Rave September 2025" 
              className="w-full h-64 sm:h-80 object-cover"
              data-testid="past-event-image"
            />
          </div>
          
          <div className="p-6 sm:p-8">
            <h3 className="text-3xl font-bold gradient-text mb-4" data-testid="past-event-title">
              AFTR: The Rave Experience
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="past-event-date">
                <Calendar className="text-primary" />
                <span>27th Sept 2025</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="past-event-time">
                <Clock className="text-primary" />
                <span>10PM - 4AM</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="past-event-venue">
                <MapPin className="text-primary" />
                <span>Shotz, Flic en Flac</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground" data-testid="past-event-attendance">
                <Users className="text-primary" />
                <span>6 Hours Non-Stop</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6" data-testid="past-event-description">
              An unforgettable night of music and energy. 5 DJs delivered non-stop vibes from 10 PM until 4 AM, 
              making this one of the most epic raves Mauritius has ever seen.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3" data-testid="past-event-feature-1">
                <CheckCircle className="text-accent" />
                <span>5 Top DJs performing back-to-back</span>
              </div>
              <div className="flex items-center space-x-3" data-testid="past-event-feature-2">
                <CheckCircle className="text-accent" />
                <span>6 hours of non-stop energy</span>
              </div>
              <div className="flex items-center space-x-3" data-testid="past-event-feature-3">
                <CheckCircle className="text-accent" />
                <span>Premium sound system & lighting</span>
              </div>
            </div>

            {/* Artist Lineup */}
            <h4 className="text-xl font-bold gradient-text mb-6" data-testid="lineup-title">
              DJ LINEUP
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {artists.map((artist, index) => (
                <div 
                  key={artist.name}
                  className="bg-muted rounded-xl p-4 text-center"
                  data-testid={`artist-card-${index}`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 overflow-hidden border-2 border-primary">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h5 className="font-bold text-sm text-foreground" data-testid={`artist-name-${index}`}>
                    {artist.name}
                  </h5>
                  <p className="text-xs text-muted-foreground" data-testid={`artist-genre-${index}`}>
                    {artist.genre}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center bg-muted rounded-2xl p-8 border border-border" data-testid="upcoming-notice">
          <h3 className="text-2xl font-bold text-foreground mb-4" data-testid="upcoming-title">
            Stay Tuned for More
          </h3>
          <p className="text-muted-foreground mb-6" data-testid="upcoming-description">
            The next AFTR event is in the works. Follow us to be the first to know when tickets drop!
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://wa.me/23058205220" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 gradient-bg text-white font-bold rounded-full hover:scale-105 transition-transform"
              data-testid="whatsapp-updates-button"
            >
              Get Updates on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
