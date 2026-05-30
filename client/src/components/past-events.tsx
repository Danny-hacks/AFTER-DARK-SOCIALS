import { Calendar, MapPin, Clock } from "lucide-react";
import aftrEventImage from "@assets/AFTR-1_1757155940525.jpg";
import aftrVol2Image from "@assets/IMG_6112_1774435245159.jpg";
import aftrVol3Image from "@assets/Promo_poster_1_1777967218262.png";
import djAlvinImage from "@assets/DJ ALVIN_1757156832389.jpg";
import djLuvleshImage from "@assets/DJ LUVLESH_1757156832389.jpg";
import djStevoImage from "@assets/STEVOTHEDJ_1757156832391.jpg";
import djSwayImage from "@assets/DJ SWAY_1757156832390.jpg";
import djAfrokeyzImage from "@assets/DJ AFROKEYZ_1757156832386.jpg";

const events = [
  {
    edition: "Volume 3",
    title: "AFTR VOL. 3",
    subtitle: "Full Capacity.",
    date: "18 Apr 2026",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description: "The biggest night yet. Every corner packed, every moment electric. Vol. 3 set a new standard for what AFTR means to Mauritius.",
    image: aftrVol3Image,
    artists: [],
    testId: "vol3",
  },
  {
    edition: "Volume 2",
    title: "AFTR VOL. 2",
    subtitle: "The Bar Raised.",
    date: "30 Jan 2026",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description: "A packed dancefloor, harder-hitting energy, and a night that proved AFTR is only getting started.",
    image: aftrVol2Image,
    artists: [
      { name: "DJ AFROKEYZ", genre: "Amapiano", image: djAfrokeyzImage },
      { name: "DJ LUVLESH",  genre: "Amapiano", image: djLuvleshImage },
      { name: "DJ SWAY",     genre: "Afrohouse", image: djSwayImage },
      { name: "DJ ALVIN",    genre: "Hip Hop", image: djAlvinImage },
      { name: "DJ SMARTFINGER", genre: "Afrobeats", image: null },
      { name: "DJ AVI.S",   genre: "Afrohouse", image: null },
    ],
    testId: "vol2",
  },
  {
    edition: "Volume 1",
    title: "AFTR: THE RAVE",
    subtitle: "Where It Began.",
    date: "27 Sep 2025",
    time: "10PM — 4AM",
    venue: "Shotz, Flic en Flac",
    description: "The night that started it all. 5 DJs, non-stop music from 10PM to 4AM — the most electric rave Mauritius had seen.",
    image: aftrEventImage,
    artists: [
      { name: "DJ ALVIN",    genre: "Hip Hop", image: djAlvinImage },
      { name: "DJ LUVLESH",  genre: "Amapiano", image: djLuvleshImage },
      { name: "STEVOTHEDJ",  genre: "Afrobeats", image: djStevoImage },
      { name: "DJ SWAY",     genre: "Afrohouse", image: djSwayImage },
      { name: "DJ AFROKEYZ", genre: "Amapiano", image: djAfrokeyzImage },
    ],
    testId: "vol1",
  },
];

export default function PastEvents() {
  return (
    <section id="past-events" className="bg-black py-28 border-t border-white/10" data-testid="past-events-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="section-line" />
          <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em] font-medium">Past Events</span>
        </div>

        {/* Title */}
        <h2
          className="text-6xl sm:text-8xl font-black text-white leading-none mb-20"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          data-testid="past-events-title"
        >
          THE NIGHTS<br />SO FAR.
        </h2>

        {/* Event list */}
        <div className="space-y-px">
          {events.map((event) => (
            <div
              key={event.testId}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/10"
              data-testid={`${event.testId}-card`}
            >
              {/* Image — 5 cols */}
              <div className="lg:col-span-5 relative overflow-hidden bg-black" style={{ minHeight: "360px" }}>
                <span className="absolute top-4 left-4 z-10 bg-black/70 text-white/40 text-[9px] uppercase tracking-[0.2em] px-3 py-1 border border-white/10">
                  Past Event
                </span>
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                  style={{ minHeight: "360px" }}
                  data-testid={`${event.testId}-image`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              </div>

              {/* Info — 7 cols */}
              <div className="lg:col-span-7 bg-black p-8 sm:p-10 flex flex-col justify-between gap-8">
                <div>
                  {/* Edition + subtitle */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] text-[#c72d28] uppercase tracking-[0.3em] font-bold">{event.edition}</span>
                    <span className="text-[10px] text-white/20 uppercase tracking-[0.2em]">{event.subtitle}</span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-5xl sm:text-6xl font-black text-white leading-none mb-8"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                    data-testid={`${event.testId}-title`}
                  >
                    {event.title}
                  </h3>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-[#c72d28]" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider">
                      <Clock className="w-3 h-3 text-[#c72d28]" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-[#c72d28]" />
                      {event.venue}
                    </div>
                  </div>

                  <p className="text-white/40 text-sm leading-relaxed max-w-md">
                    {event.description}
                  </p>
                </div>

                {/* DJ lineup */}
                {event.artists.length > 0 && (
                  <div className="border-t border-white/10 pt-8">
                    <p className="text-[9px] text-white/25 uppercase tracking-[0.3em] mb-5">DJ Lineup</p>
                    <div className="flex flex-wrap gap-3">
                      {event.artists.map((artist) => (
                        <div key={artist.name} className="flex items-center gap-2">
                          <div className="w-7 h-7 overflow-hidden bg-white/5 flex-shrink-0">
                            {artist.image ? (
                              <img src={artist.image} alt={artist.name} className="w-full h-full object-cover grayscale" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white/20 text-[6px] uppercase font-bold text-center leading-tight px-0.5">{artist.name.split(" ")[1] || artist.name}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-[9px] font-bold uppercase leading-none">{artist.name}</p>
                            <p className="text-white/30 text-[8px] mt-0.5">{artist.genre}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}