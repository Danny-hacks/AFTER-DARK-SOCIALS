import { SiWhatsapp } from "react-icons/si";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import comingSoonImage from "@assets/AFTR_black_white_1766249732057.jpg";

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
    <div className="flex justify-center gap-3 sm:gap-6 mb-8" data-testid="countdown-timer">
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[90px]">
          <span className="text-3xl sm:text-5xl font-bold text-white" data-testid="countdown-days">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[90px]">
          <span className="text-3xl sm:text-5xl font-bold text-white" data-testid="countdown-hours">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[90px]">
          <span className="text-3xl sm:text-5xl font-bold text-white" data-testid="countdown-minutes">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Mins</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-black/50 backdrop-blur-sm border border-[#c72d28]/50 rounded-xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[90px]">
          <span className="text-3xl sm:text-5xl font-bold text-white" data-testid="countdown-seconds">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider">Secs</span>
      </div>
    </div>
  );
}

export default function ComingSoonBanner() {
  const eventDate = new Date('2026-01-30T22:00:00+04:00');

  return (
    <section id="coming-soon" className="py-20 bg-gradient-to-b from-background via-card to-background" data-testid="coming-soon-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl overflow-hidden" data-testid="coming-soon-card">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold" data-testid="coming-soon-badge">
                30 JANUARY 2026
              </span>
            </div>
            
            <img 
              src={comingSoonImage} 
              alt="AFTR Volume 2" 
              className="w-full h-80 sm:h-[500px] object-cover object-center"
              data-testid="coming-soon-image"
            />
          </div>
          
          <div className="p-6 sm:p-8">
            <h3 className="text-3xl font-bold gradient-text mb-6" data-testid="coming-soon-event-title">
              AFTR Volume 2
            </h3>

            <CountdownTimer targetDate={eventDate} />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-muted-foreground" data-testid="coming-soon-date">
                <Calendar className="text-primary" />
                <span>30th January 2026</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-muted-foreground" data-testid="coming-soon-time">
                <Clock className="text-primary" />
                <span>10PM - 4AM</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-muted-foreground" data-testid="coming-soon-venue">
                <MapPin className="text-primary" />
                <span>Saxo, Flic en Flac</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-8 text-center" data-testid="coming-soon-text">
              Get ready for the next edition of the rave that keeps the city awake. 
              Join our community to be the first to know when tickets drop.
            </p>

            <div className="flex justify-center">
              <a 
                href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 gradient-bg text-white font-bold rounded-full hover:scale-105 transition-transform text-lg"
                data-testid="coming-soon-cta"
              >
                <SiWhatsapp className="text-xl" />
                Join AFTR Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
