import { CheckCircle } from "lucide-react";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djLuvleshImage from "@assets/DJ LUVLESH_1757156832389.jpg";
import djStevoImage from "@assets/STEVOTHEDJ_1757156832391.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";

const artists = [
  { name: "Dj Alvin", genre: "Electronic", image: djAlvinImage },
  { name: "Dj Luvlesh", genre: "Electronic", image: djLuvleshImage },
  { name: "Stevo The Dj", genre: "Electronic", image: djStevoImage },
  { name: "Dj Sway", genre: "Electronic", image: djSwayImage },
  { name: "Dj Afrokeyz", genre: "Electronic", image: djAfrokeyzImage },
];

export default function EventDetails() {
  return (
    <section id="event" className="py-20 bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6" data-testid="event-details-title">
            The Rave Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="event-details-description">
            Get ready for AFTR — the rave that keeps the city awake! 5 DJs, 6 hours of non-stop energy, 
            and one unforgettable night this 27th September.
          </p>
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
              AFTR brings together the hottest DJs for an explosive celebration of electronic music. 
              Door opens by 10pm, first act starts at 10:30. Experience non-stop beats that will keep 
              you dancing until 4am.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3" data-testid="feature-artists">
                <CheckCircle className="text-accent text-xl" />
                <span className="text-lg">5 Top Electronic DJs</span>
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
            DJ Lineup
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
