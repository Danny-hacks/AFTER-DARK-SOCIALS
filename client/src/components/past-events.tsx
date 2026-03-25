import { Calendar, MapPin, Clock, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/IMG_6112_1774435245159.JPG";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djLuvleshImage from "@assets/DJ LUVLESH_1757156832389.jpg";
import djStevoImage from "@assets/STEVOTHEDJ_1757156832391.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";
import screenshotDec from "@assets/Screenshot_2025-12-22_at_08.17.45_1766387937769.png";
import screenshotJanA from "@assets/Screenshot_2026-01-06_at_05.13.49_1767672933262.png";
import screenshotJanB from "@assets/Screenshot_2026-01-06_at_05.21.29_1767673299189.png";
import type { Event } from "@shared/schema";
import { useState } from "react";

const vol1Artists = [
  { name: "DJ ALVIN", genre: "Hip Hop", image: djAlvinImage },
  { name: "DJ LUVLESH", genre: "Amapiano", image: djLuvleshImage },
  { name: "STEVOTHEDJ", genre: "Afrobeats & Dancehall", image: djStevoImage },
  { name: "DJ SWAY", genre: "Afrohouse & Amapiano", image: djSwayImage },
  { name: "DJ AFROKEYZ", genre: "Amapiano & 3 Steps", image: djAfrokeyzImage },
];

const vol2Artists = [
  { name: "DJ ALVIN", genre: "Hip Hop", image: djAlvinImage },
  { name: "DJ LUVLESH", genre: "Amapiano", image: djLuvleshImage },
  { name: "STEVOTHEDJ", genre: "Afrobeats & Dancehall", image: djStevoImage },
  { name: "DJ SWAY", genre: "Afrohouse & Amapiano", image: djSwayImage },
  { name: "DJ AFROKEYZ", genre: "Amapiano & 3 Steps", image: djAfrokeyzImage },
];

function VideoPlayer({ videoUrl, poster }: { videoUrl: string; poster: string }) {
  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      <video controls className="w-full h-full" poster={poster} data-testid="event-video-player">
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}

interface PastEventCardProps {
  edition: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string;
  imageAlt: string;
  videoUrl?: string | null;
  artists?: { name: string; genre: string; image: string }[];
  testIdPrefix: string;
}

function PastEventCard({
  edition, title, date, time, venue, description,
  image, imageAlt, videoUrl, artists, testIdPrefix,
}: PastEventCardProps) {
  const [showVideo, setShowVideo] = useState(false);

  const titleLines = title.split('\n');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10" data-testid={`${testIdPrefix}-card`}>
      {/* Image / Video */}
      <div className="relative bg-black overflow-hidden" style={{ minHeight: '400px' }}>
        <span
          className="absolute top-4 left-4 z-10 bg-black/80 text-white/40 text-[10px] uppercase tracking-[0.2em] px-3 py-1 border border-white/10"
          data-testid={`${testIdPrefix}-badge`}
        >
          Past Event
        </span>

        {videoUrl && showVideo ? (
          <VideoPlayer videoUrl={videoUrl} poster={image} />
        ) : (
          <div className="relative h-full">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover opacity-80"
              style={{ minHeight: '400px' }}
              data-testid={`${testIdPrefix}-image`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            {videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute inset-0 flex items-center justify-center group"
                data-testid={`${testIdPrefix}-play-button`}
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
          <p className="text-[10px] text-[#c72d28] uppercase tracking-[0.3em] font-bold mb-4">{edition}</p>

          <h3
            className="text-5xl sm:text-6xl font-black text-white leading-none mb-8"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
            data-testid={`${testIdPrefix}-title`}
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h3>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-wider" data-testid={`${testIdPrefix}-date`}>
              <Calendar className="w-3.5 h-3.5 text-[#c72d28] flex-shrink-0" />
              {date}
            </div>
            <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-wider" data-testid={`${testIdPrefix}-time`}>
              <Clock className="w-3.5 h-3.5 text-[#c72d28] flex-shrink-0" />
              {time}
            </div>
            <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-wider" data-testid={`${testIdPrefix}-venue`}>
              <MapPin className="w-3.5 h-3.5 text-[#c72d28] flex-shrink-0" />
              {venue}
            </div>
          </div>

          <p className="text-white/40 text-sm leading-relaxed mb-8" data-testid={`${testIdPrefix}-description`}>
            {description}
          </p>

          {videoUrl && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="group flex items-center gap-4 text-white/40 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors"
              data-testid={`${testIdPrefix}-watch-button`}
            >
              <Play className="w-4 h-4" />
              Watch Recap
              <span className="w-6 h-px bg-current group-hover:w-10 transition-all" />
            </button>
          )}
        </div>

        {/* Artist lineup (optional) */}
        {artists && artists.length > 0 && (
          <div className="border-t border-white/10 pt-8 mt-8">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-6" data-testid={`${testIdPrefix}-lineup-title`}>
              DJ Lineup
            </p>
            <div className="grid grid-cols-5 gap-3">
              {artists.map((artist, index) => (
                <div key={artist.name} className="text-center" data-testid={`${testIdPrefix}-artist-${index}`}>
                  <div className="w-full aspect-square mb-2 overflow-hidden">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                    />
                  </div>
                  <p className="text-white text-[9px] font-bold uppercase tracking-wide leading-tight">
                    {artist.name}
                  </p>
                  <p className="text-white/30 text-[8px] leading-tight mt-0.5">
                    {artist.genre}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PastEvents() {
  const { data: eventsData } = useQuery<{ success: boolean; events: Event[] }>({
    queryKey: ['/api/events/past'],
  });

  const pastEvents = eventsData?.events || [];
  const vol1Event = pastEvents.find(e => e.name?.toLowerCase().includes('vol 1') || (e.name?.toLowerCase().includes('aftr') && !e.name?.toLowerCase().includes('vol 2')));
  const vol2Event = pastEvents.find(e => e.name?.toLowerCase().includes('vol 2') || e.name?.toLowerCase().includes('volume 2'));
  const mainEvent = vol1Event || pastEvents[pastEvents.length - 1];

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
          className="text-6xl sm:text-8xl font-black text-white leading-none mb-20"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          data-testid="past-events-title"
        >
          THE NIGHTS<br />SO FAR.
        </h2>

        {/* Vol 2 — most recent first */}
        <div className="mb-px">
          <PastEventCard
            edition="Volume 2"
            title={"AFTR\nVOL. 2"}
            date="30th January 2026"
            time="10PM — 4AM"
            venue="Shotz, Flic en Flac"
            description="The second edition raised the bar — a packed dancefloor, harder-hitting energy, and a night that proved AFTR is only getting started."
            image={aftrVol2Image}
            imageAlt="AFTR Volume 2"
            videoUrl={vol2Event?.videoUrl ?? null}
            artists={vol2Artists}
            testIdPrefix="vol2-event"
          />
        </div>

        {/* Vol 1 */}
        <div className="mt-px">
          <PastEventCard
            edition="Volume 1"
            title={"AFTR:\nTHE RAVE\nEXPERIENCE"}
            date="27th September 2025"
            time="10PM — 4AM"
            venue="Shotz, Flic en Flac"
            description="An unforgettable night of music and energy. 5 DJs delivered non-stop vibes from 10 PM until 4 AM, making this one of the most epic raves Mauritius has ever seen."
            image={aftrEventImage}
            imageAlt="AFTR Rave September 2025"
            videoUrl={mainEvent?.videoUrl ?? null}
            artists={vol1Artists}
            testIdPrefix="past-event"
          />
        </div>

      </div>
    </section>
  );
}
  