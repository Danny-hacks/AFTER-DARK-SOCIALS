import { Music, Users, Zap, Heart } from "lucide-react";

export default function AboutSection() {
  const scrollToEvents = () => {
    const element = document.getElementById('past-events');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-black to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] text-purple-400 uppercase font-medium mb-4 block">
            About Us
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6" data-testid="about-title">
            What is <span className="gradient-text">AFTR</span>?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8" data-testid="about-description">
            AFTR is more than just a party — it's a movement. Born from the underground rave culture of Mauritius, 
            we bring together the island's finest DJs, pulsating beats, and an electrifying atmosphere that keeps 
            you dancing until the sun comes up.
          </p>
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed" data-testid="about-description-2">
            From Amapiano to Afrobeats, Hip Hop to House — we curate sonic experiences that unite people through 
            the universal language of music. When the city sleeps, AFTR comes alive.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1" data-testid="about-feature-music">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Music className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Multiple Genres</h3>
            <p className="text-white/60 text-sm">Amapiano, Afrobeats, Hip Hop, House, and everything in between.</p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1" data-testid="about-feature-djs">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Top DJs</h3>
            <p className="text-white/60 text-sm">Featuring Mauritius' finest selectors and rising talents.</p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1" data-testid="about-feature-energy">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Non-Stop Energy</h3>
            <p className="text-white/60 text-sm">6+ hours of continuous music and unstoppable vibes.</p>
          </div>

          <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1" data-testid="about-feature-community">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
            <p className="text-white/60 text-sm">A family of ravers united by the love of music.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={scrollToEvents}
            className="inline-flex items-center px-8 py-4 gradient-bg text-white font-bold text-lg rounded-full hover:scale-105 transition-transform"
            data-testid="view-events-button"
          >
            See Our Events
          </button>
        </div>
      </div>
    </section>
  );
}
