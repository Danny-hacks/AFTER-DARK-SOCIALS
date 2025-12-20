import { Calendar, MapPin, Clock, Users, CheckCircle, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djLuvleshImage from "@assets/DJ LUVLESH_1757156832389.jpg";
import djStevoImage from "@assets/STEVOTHEDJ_1757156832391.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";
import type { Event } from "@shared/schema";
import { useState } from "react";

const artists = [
  { name: "DJ ALVIN", genre: "Hip Hop", image: djAlvinImage },
  { name: "DJ LUVLESH", genre: "Amapiano", image: djLuvleshImage },
  { name: "STEVOTHEDJ", genre: "Afrobeats & Dancehall", image: djStevoImage },
  { name: "DJ SWAY", genre: "Afrohouse & Amapiano", image: djSwayImage },
  { name: "DJ AFROKEYZ", genre: "Amapiano & 3 Steps", image: djAfrokeyzImage },
];

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video 
        controls 
        className="w-full h-full"
        poster={aftrEventImage}
        data-testid="event-video-player"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default function PastEvents() {
  const [showVideo, setShowVideo] = useState(false);

  const { data: eventsData } = useQuery<{ success: boolean; events: Event[] }>({
    queryKey: ['/api/events/past'],
  });

  const pastEvents = eventsData?.events || [];
  const mainEvent = pastEvents.find(e => e.name?.includes('AFTR'));

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
            
            {/* Video or Image */}
            {mainEvent?.videoUrl && showVideo ? (
              <div className="p-4">
                <VideoPlayer videoUrl={mainEvent.videoUrl} />
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={aftrEventImage} 
                  alt="AFTR Rave September 2025" 
                  className="w-full h-64 sm:h-80 object-cover"
                  data-testid="past-event-image"
                />
                {mainEvent?.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
                    data-testid="play-video-button"
                  >
                    <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                  </button>
                )}
              </div>
            )}
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

            {/* Video Section */}
            {mainEvent?.videoUrl && !showVideo && (
              <div className="mb-8">
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full py-4 px-6 gradient-bg text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                  data-testid="watch-recap-button"
                >
                  <Play className="w-6 h-6" />
                  Watch Event Recap
                </button>
              </div>
            )}

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

      </div>
    </section>
  );
}
