import { Calendar, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import comingSoonImage from "@assets/AFTR_black_white_1766249732057.jpg";

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
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

  const units = [
    { value: timeLeft.days, label: 'Days', testId: 'countdown-days' },
    { value: timeLeft.hours, label: 'Hrs', testId: 'countdown-hours' },
    { value: timeLeft.minutes, label: 'Min', testId: 'countdown-minutes' },
    { value: timeLeft.seconds, label: 'Sec', testId: 'countdown-seconds' },
  ];

  return (
    <div className="flex gap-0 border border-white/10" data-testid="countdown-timer">
      {units.map((unit, i) => (
        <div
          key={unit.label}
          className={`flex-1 py-5 text-center ${i < units.length - 1 ? 'border-r border-white/10' : ''}`}
        >
          <div
            className="text-4xl sm:text-5xl font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
            data-testid={unit.testId}
          >
            {String(unit.value).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ComingSoonBanner() {
  const eventDate = new Date('2026-01-30T22:00:00+04:00');

  return (
    <section id="coming-soon" className="bg-black py-0" data-testid="coming-soon-section">
      {/* Full-bleed image with overlay content */}
      <div className="relative" data-testid="coming-soon-card">
        {/* Background image */}
        <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
          <img
            src={comingSoonImage}
            alt="AFTR Volume 2"
            className="w-full h-full object-cover object-top opacity-60"
            data-testid="coming-soon-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

          {/* Badge */}
          <div className="absolute top-6 left-6 sm:top-10 sm:left-12">
            <span
              className="inline-block bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 font-bold"
              data-testid="coming-soon-badge"
            >
              Upcoming Event
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
            <h3
              className="text-7xl sm:text-9xl font-black text-white leading-none tracking-tight mb-2"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
              data-testid="coming-soon-event-title"
            >
              AFTR<br />VOL. 2
            </h3>
          </div>
        </div>

        {/* Info strip */}
        <div className="bg-black border-t border-white/10 px-6 sm:px-12 py-6">
          <div className="flex flex-wrap gap-6 sm:gap-10 mb-0">
            <div className="flex items-center gap-2 text-white/50 text-sm" data-testid="coming-soon-date">
              <Calendar className="w-4 h-4 text-[#c72d28]" />
              <span className="uppercase tracking-wider text-xs">30th Jan 2026</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm" data-testid="coming-soon-time">
              <Clock className="w-4 h-4 text-[#c72d28]" />
              <span className="uppercase tracking-wider text-xs">10PM — 4AM</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm" data-testid="coming-soon-venue">
              <MapPin className="w-4 h-4 text-[#c72d28]" />
              <span className="uppercase tracking-wider text-xs">Shotz, Flic en Flac</span>
            </div>
          </div>
        </div>

        {/* Countdown + CTA */}
        <div className="bg-black px-6 sm:px-12 pb-16">
          <CountdownTimer targetDate={eventDate} />

          <div className="mt-8">
            <p className="text-white/40 text-sm mb-6" data-testid="coming-soon-text">
              The rave returns — bigger, louder, unstoppable. Get ready for the next edition of the rave that keeps the city awake.
            </p>
            <Link
              href="/event"
              className="inline-flex items-center gap-4 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-[#c72d28] hover:text-white transition-colors"
              data-testid="view-event-button"
            >
              Get Tickets
              <span className="w-6 h-px bg-current" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
