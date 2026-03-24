import { Calendar, MapPin, Clock, Play } from "lucide-react";
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
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <video controls className="w-full h-full" poster={aftrEventImage} data-testid="event-video-player">
        <source src={videoUrl} type="video/mp4" />
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
    <section id="past-events" className="bg-black py-28" data-testid="past-events-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-line" />
          <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em] font-medium">
            Past Events
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-6xl sm:text-8xl font-black text-white leading-none mb-16"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          data-testid="past-events-title"
        >
          THE FIRST<br />NIGHT.
        </h2>

        {/* Event block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10" data-testid="past-event-card">
          {/* Image / Video */}
          <div className="relative bg-black overflow-hidden" style={{ minHeight: '400px' }}>
            <span
              className="absolute top-4 left-4 z-10 bg-black/80 text-white/50 text-[10px] uppercase tracking-[0.2em] px-3 py-1 border border-white/10"
              data-testid="past-event-badge"
            >
              Past Event
            </span>

            {mainEvent?.videoUrl && showVideo ? (
              <VideoPlayer videoUrl={mainEvent.videoUrl} />
            ) : (
              <div className="relative h-full">
                <img
                  src={aftrEventImage}
                  alt="AFTR Rave September 2025"
                  className="w-full h-full object-cover opacity-80"
                  style={{ minHeight: '400px' }}
                  data-testid="past-event-image"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                {mainEvent?.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                    data-testid="play-video-button"
                  >
                    <div className="w-16 h-16 border-2 border-white/40 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-black p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <h3
                className="text-5xl sm:text-6xl font-black text-white leading-none mb-8"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                data-testid="past-event-title"
              >
                AFTR:<br />THE RAVE<br />EXPERIENCE
              </h3>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-wider" data-testid="past-event-date">
                  <Calendar className="w-3.5 h-3.5 text-[#c72d28]" />
                  27th September 2025
                </div>
                <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-wider" data-testid="past-event-time">
                  <Clock className="w-3.5 h-3.5 text-[#c72d28]" />
                  10PM — 4AM
                </div>
                <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-wider" data-testid="past-event-venue">
                  <MapPin className="w-3.5 h-3.5 text-[#c72d28]" />
                  Shotz, Flic en Flac
                </div>
              </div>

              <p className="text-white/50 text-sm leading-relaxed mb-8" data-testid="past-event-description">
                An unforgettable night of music and energy. 5 DJs delivered non-stop vibes from 10 PM 
                until 4 AM, making this one of the most epic raves Mauritius has ever seen.
              </p>

              {mainEvent?.videoUrl && !showVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="group flex items-center gap-4 text-white/50 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors mb-8"
                  data-testid="watch-recap-button"
                >
                  <Play className="w-4 h-4" />
                  Watch Recap
                  <span className="w-6 h-px bg-current group-hover:w-10 transition-all" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-8">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-6" data-testid="lineup-title">
                DJ Lineup
              </p>
              <div className="grid grid-cols-5 gap-3">
                {artists.map((artist, index) => (
                  <div key={artist.name} className="text-center" data-testid={`artist-card-${index}`}>
                    <div className="w-full aspect-square mb-2 overflow-hidden">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                      />
                    </div>
                    <p className="text-white text-[9px] font-bold uppercase tracking-wide leading-tight" data-testid={`artist-name-${index}`}>
                      {artist.name}
                    </p>
                    <p className="text-white/30 text-[8px] leading-tight mt-0.5" data-testid={`artist-genre-${index}`}>
                      {artist.genre}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
