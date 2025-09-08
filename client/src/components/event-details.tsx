import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
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

export default function EventDetails() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const eventDate = new Date('2025-09-27T22:00:00').getTime(); // September 27, 2025 at 10 PM

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="event" className="py-20 bg-gradient-to-b from-background via-card to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="event-details-title">
            The Rave Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="event-details-description">
            Get ready for AFTR — the rave that keeps the city awake! 5 DJs, 6 hours of non-stop energy, 
            and one unforgettable night this 27th September.
          </p>
          
          {/* Countdown Timer */}
          <div className="bg-background border-2 border-primary rounded-2xl p-8 max-w-4xl mx-auto" data-testid="countdown-container">
            <h3 className="text-2xl font-bold gradient-text mb-6">COUNTDOWN TO AFTR</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border" data-testid="countdown-days">
                <div className="text-4xl font-black gradient-text">{timeLeft.days}</div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Days</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border" data-testid="countdown-hours">
                <div className="text-4xl font-black gradient-text">{timeLeft.hours}</div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Hours</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border" data-testid="countdown-minutes">
                <div className="text-4xl font-black gradient-text">{timeLeft.minutes}</div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Minutes</div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border" data-testid="countdown-seconds">
                <div className="text-4xl font-black gradient-text">{timeLeft.seconds}</div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Seconds</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img 
              src={aftrEventImage} 
              alt="AFTR rave event with neon branding and crowd" 
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              data-testid="festival-stage-image"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="entertainment-title">
              6 Hours of Pure Energy
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="entertainment-description">
              AFTR unites the hottest DJs for an unforgettable night of music and energy. 
              Doors open at 10 PM, with the first act kicking off at 10:30. Dance the night away with 
              non-stop vibes until 4 AM.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3" data-testid="feature-artists">
                <CheckCircle className="text-accent text-xl" />
                <span className="text-lg">5 Top DJs</span>
              </div>
              <div className="flex items-center space-x-3" data-testid="feature-stages">
                <CheckCircle className="text-accent text-xl" />
                <span className="text-lg">Premium Sound System</span>
              </div>
              <div className="flex items-center space-x-3" data-testid="feature-food">
                <CheckCircle className="text-accent text-xl" />
                <span className="text-lg">Bar & Refreshments Available</span>
              </div>
              <div className="flex items-center space-x-3" data-testid="feature-vip">
                <CheckCircle className="text-accent text-xl" />
                <span className="text-lg">6 Hours Non-Stop Energy</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Artist Lineup */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center gradient-text mb-12" data-testid="lineup-title">
            DJ LINEUP
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {artists.map((artist, index) => {
              return (
                <div 
                  key={artist.name}
                  className="bg-muted rounded-xl p-6 text-center hover:scale-105 transition-transform"
                  data-testid={`artist-card-${index}`}
                >
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-2 border-primary">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-lg text-foreground" data-testid={`artist-name-${index}`}>
                    {artist.name}
                  </h4>
                  <p className="text-muted-foreground" data-testid={`artist-genre-${index}`}>
                    {artist.genre}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
