import { Calendar, MapPin, Clock, Users, CheckCircle, ArrowLeft, Music, Sparkles, Volume2, Navigation, Menu, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import comingSoonImage from "@assets/AFTR_black_white_1766249732057.jpg";
import logoImage from "@assets/ChatGPT_Image_Dec_22,_2025,_08_25_03_AM_1766388371283.png";

const eventNavLinks = [
  { name: "Details", href: "#details" },
  { name: "Tickets", href: "#tickets" },
  { name: "Venue", href: "#venue" },
];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 sm:gap-8" data-testid="countdown-timer">
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-days">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-hours">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-minutes">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Mins</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-6 sm:px-8 py-4 sm:py-6 min-w-[80px] sm:min-w-[100px]">
          <span className="text-4xl sm:text-6xl font-bold text-white" data-testid="countdown-seconds">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        <span className="text-sm sm:text-base text-muted-foreground mt-3 uppercase tracking-wider">Secs</span>
      </div>
    </div>
  );
}

export default function EventPage() {
  const eventDate = new Date('2026-01-30T22:00:00+04:00');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src={logoImage} alt="After Dark Socials" className="h-12 w-auto" />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              {eventNavLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-white/80 hover:text-white transition-colors text-sm uppercase tracking-wider"
                  data-testid={`nav-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-4">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm uppercase tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
                {eventNavLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/80 hover:text-white transition-colors text-sm uppercase tracking-wider text-left"
                    data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="relative h-[60vh] sm:h-[70vh]">
          <img 
            src={comingSoonImage} 
            alt="AFTR Volume 2" 
            className="w-full h-full object-cover"
            data-testid="event-hero-image"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <span className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm font-bold mb-6" data-testid="event-badge">
                30 JANUARY 2026
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black gradient-text mb-4" data-testid="event-title">
                AFTR Volume 2
              </h1>
              <p className="text-xl sm:text-2xl text-white/80 mb-8">The Rave That Keeps The City Awake</p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 bg-gradient-to-b from-background to-card">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Countdown to the Rave</h2>
          <CountdownTimer targetDate={eventDate} />
        </div>
      </section>

      {/* Event Details */}
      <section id="details" className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-12" data-testid="event-details-title">
            Event Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-date-card">
              <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Date</h3>
              <p className="text-muted-foreground">Friday, 30th January 2026</p>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-time-card">
              <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Time</h3>
              <p className="text-muted-foreground">10PM - 4AM</p>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-venue-card">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Venue</h3>
              <p className="text-muted-foreground">Shotz, Flic en Flac</p>
            </div>
            <div className="bg-muted rounded-xl p-6 text-center" data-testid="event-duration-card">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Duration</h3>
              <p className="text-muted-foreground">6 Hours Non-Stop</p>
            </div>
          </div>

          <div className="bg-muted rounded-xl p-8" data-testid="event-description">
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              The rave returns — bigger, louder, unstoppable. AFTR Volume 2 promises to be an unforgettable night 
              of music and energy, bringing together the best DJs for 6 hours of non-stop vibes. 
              Get ready for the next edition of the rave that keeps the city awake.
            </p>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-12" data-testid="expect-title">
            What to Expect
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Music className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Top DJs</h3>
                <p className="text-muted-foreground">World-class DJs performing back-to-back sets all night long</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Volume2 className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Premium Sound</h3>
                <p className="text-muted-foreground">State-of-the-art sound system for crystal clear audio</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <Sparkles className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Epic Lighting</h3>
                <p className="text-muted-foreground">Immersive lighting effects and visual production</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-card rounded-xl p-6 border border-border">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-bold text-white mb-2">Safe Environment</h3>
                <p className="text-muted-foreground">Professional security and organized event management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section id="tickets" className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-6" data-testid="tickets-title">
            Tickets
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Tickets will be available soon. Join our community to be the first to know when they drop!
          </p>
          
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <div className="text-center">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Early Bird Tickets</span>
              <p className="text-4xl font-bold gradient-text my-4">Coming Soon</p>
              <p className="text-muted-foreground">Be the first to secure your spot at AFTR Volume 2</p>
            </div>
          </div>

          <a 
            href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 gradient-bg text-white font-bold rounded-full hover:scale-105 transition-transform text-lg"
            data-testid="join-community-button"
          >
            <SiWhatsapp className="text-xl" />
            Join AFTR Community for Updates
          </a>
        </div>
      </section>

      {/* Venue Section */}
      <section id="venue" className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text text-center mb-12" data-testid="venue-title">
            Venue
          </h2>
          
          <div className="bg-muted rounded-xl overflow-hidden">
            {/* Google Map Embed */}
            <div className="w-full h-64 sm:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.8!2d57.36539!3d-20.28325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDE2JzU5LjciUyA1N8KwMjEnNTUuNCJF!5e0!3m2!1sen!2smu!4v1600000000000!5m2!1sen!2smu"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shotz Flic en Flac Location"
                data-testid="venue-map"
              />
            </div>
            
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Shotz</h3>
              <p className="text-lg text-muted-foreground mb-4">Flic en Flac, Mauritius</p>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Located in the heart of Flic en Flac, Shotz provides the perfect setting for an epic night of music and dancing. 
                Easy to find and accessible from all parts of the island.
              </p>
              
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=-20.28325,57.36539&destination_place_id=Shotz+Flic+en+Flac"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
                data-testid="get-directions-button"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img src={logoImage} alt="After Dark Socials" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            &copy; 2026 AFTR. All rights reserved. The rave that keeps the city awake.
          </p>
        </div>
      </footer>
    </div>
  );
}
