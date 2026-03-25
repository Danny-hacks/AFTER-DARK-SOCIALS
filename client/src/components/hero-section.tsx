import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { HeroSlide } from "@shared/schema";
import heroImage from "@assets/stock_images/dark_nightclub_rave__d23cebfd.jpg";
import aftr2Image from "@assets/IMG_6112_1774435245159.JPG";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data, isLoading } = useQuery<{ success: boolean; slides: HeroSlide[] }>({
    queryKey: ['/api/hero-slides'],
  });

  const processedSlides = (data?.slides || []).map(slide => {
    let processedUrl = slide.url;
    if (slide.url.includes('/assets/stock_images/')) processedUrl = heroImage;
    else if (slide.url.includes('AFTR_black_white')) processedUrl = aftr2Image;
    return { ...slide, url: processedUrl };
  });

  const hasSlides = processedSlides.length > 0;

  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    if (processedSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % processedSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [processedSlides.length]);

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % processedSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + processedSlides.length) % processedSlides.length);

  return (
    <section className="relative h-screen flex items-end justify-start overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Nightclub rave"
          className="w-full h-full object-cover"
          data-testid="hero-background-image"
        />
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
                autoPlay muted loop playsInline
                data-testid={`hero-video-${index}`}
              />
            ) : (
              <img
                src={slide.url}
                alt={slide.title || 'Hero background'}
                className="w-full h-full object-cover"
                data-testid={`hero-image-${index}`}
              />
            )}
          </div>
        ))}
        {/* Heavy dark overlay - bottom-heavy for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Slide arrows */}
      {hasSlides && processedSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 border border-white/20 text-white/60 hover:text-white hover:border-white/60 transition-all"
            data-testid="prev-slide-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 border border-white/20 text-white/60 hover:text-white hover:border-white/60 transition-all"
            data-testid="next-slide-button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Main content — bottom-left editorial layout */}
      <div className={`relative z-10 px-6 sm:px-12 lg:px-20 pb-20 sm:pb-28 w-full transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Red accent line */}
        <div className="w-10 h-0.5 bg-[#c72d28] mb-6" />

        <h1
          className="font-display text-[min(22vw,180px)] leading-none tracking-tight text-white mb-4"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          data-testid="brand-title"
        >
          AFTR
        </h1>

        <p
          className="text-sm sm:text-base text-white/50 font-light tracking-[0.3em] uppercase mb-8 max-w-sm"
          data-testid="brand-tagline"
        >
          The Rave That Keeps The City Awake
        </p>

        <div className="flex items-center gap-6">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#c72d28] rounded-full animate-pulse" />
            <span className="text-white/40 text-xs tracking-[0.2em] uppercase">Mauritius</span>
          </div>

          {hasSlides && processedSlides.length > 1 && (
            <div className="flex gap-2" data-testid="slide-indicators">
              {processedSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-6 h-px transition-all duration-300 ${
                    index === currentSlide ? 'bg-[#c72d28]' : 'bg-white/30 hover:bg-white/60'
                  }`}
                  data-testid={`slide-indicator-${index}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2 text-white/30 hover:text-white/70 transition-colors"
        data-testid="scroll-indicator"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase rotate-90 mb-2">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
}
