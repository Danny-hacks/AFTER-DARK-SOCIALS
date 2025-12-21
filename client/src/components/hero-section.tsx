import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HeroSlide } from "@shared/schema";
import heroImage from "@assets/stock_images/dark_nightclub_rave__d23cebfd.jpg";
import aftr2Image from "@assets/AFTR_black_white_1766249732057.jpg";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data, isLoading } = useQuery<{ success: boolean; slides: HeroSlide[] }>({
    queryKey: ['/api/hero-slides'],
  });

  // Process slides - replace local asset paths with imported images
  const processedSlides = (data?.slides || []).map(slide => {
    let processedUrl = slide.url;
    if (slide.url.includes('/assets/stock_images/')) {
      processedUrl = heroImage;
    } else if (slide.url.includes('AFTR_black_white')) {
      processedUrl = aftr2Image;
    }
    return { ...slide, url: processedUrl };
  });
  
  const hasSlides = processedSlides.length > 0;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (processedSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % processedSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [processedSlides.length]);

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % processedSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + processedSlides.length) % processedSlides.length);
  };

  const currentSlideData = hasSlides ? processedSlides[currentSlide] : null;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background slides */}
      <div className="absolute inset-0">
        {/* Always show default image as base layer */}
        <img
          src={heroImage}
          alt="Nightclub rave with crowd silhouettes and colorful lights"
          className="w-full h-full object-cover scale-105"
          data-testid="hero-background-image"
        />
        
        {/* Overlay slides on top when loaded */}
        {hasSlides && !isLoading && processedSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.type === 'video' ? (
              <video
                src={slide.url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                data-testid={`hero-video-${index}`}
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.title || 'Hero background'}
                className="w-full h-full object-cover scale-105"
                data-testid={`hero-image-${index}`}
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
      </div>

      {/* Animated glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c72d28]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c72d28]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Slide navigation arrows */}
      {hasSlides && processedSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-black/50 transition-all"
            data-testid="prev-slide-button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-black/50 transition-all"
            data-testid="next-slide-button"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* Main content */}
      <div className={`relative z-10 text-center px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo/Brand */}
        <div className="mb-4">
          <span className="text-sm sm:text-base tracking-[0.3em] text-[#c72d28] uppercase font-medium">
            After Dark Social
          </span>
        </div>
        
        <h1 
          className="text-8xl sm:text-9xl md:text-[12rem] font-black tracking-tight mb-4"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #c72d28 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 80px rgba(199, 45, 40, 0.5)',
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

      {/* Slide indicators */}
      {hasSlides && processedSlides.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-3" data-testid="slide-indicators">
          {processedSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-[#c72d28] w-10' 
                  : 'bg-white/50 w-3 hover:bg-white/80'
              }`}
              data-testid={`slide-indicator-${index}`}
            />
          ))}
        </div>
      )}

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
