import { ChevronDown } from "lucide-react";
import aftrHeroImage from "@assets/AFTR_1757155849539.jpg";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with parallax-like effect */}
      <div className="absolute inset-0">
        <img 
          src={aftrHeroImage} 
          alt="AFTR rave with neon lights and crowd silhouette" 
          className="w-full h-full object-cover scale-110"
          data-testid="hero-background-image"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
      </div>

      {/* Animated glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Main content */}
      <div className={`relative z-10 text-center px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo/Brand */}
        <div className="mb-6">
          <span className="text-sm sm:text-base tracking-[0.3em] text-white/60 uppercase font-light">
            Welcome to
          </span>
        </div>
        
        <h1 
          className="text-8xl sm:text-9xl md:text-[12rem] font-black tracking-tight mb-4"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #a855f7 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 80px rgba(168, 85, 247, 0.5)',
          }}
          data-testid="brand-title"
        >
          AFTR
        </h1>
        
        <p 
          className="text-xl sm:text-2xl md:text-3xl text-white/80 font-light tracking-wide mb-12"
          data-testid="brand-tagline"
        >
          The Rave That Keeps The City Awake
        </p>

        {/* Location badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-16">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-white/90 text-sm sm:text-base">Mauritius</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer group"
        data-testid="scroll-indicator"
      >
        <span className="text-xs tracking-widest uppercase">Discover</span>
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </button>
    </section>
  );
}
