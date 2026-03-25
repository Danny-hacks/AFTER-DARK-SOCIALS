import { Calendar, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

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
  const eventDate = new Date('2026-04-18T22:00:00+04:00');

  return (
    <section id="coming-soon" className="bg-black py-0" data-testid="coming-soon-section">
      <div className="relative" data-testid="coming-soon-card">

        {/* Full black hero block — no image for Vol 3 yet */}
        <div className="relative bg-[#050505] border-t border-b border-white/10 overflow-hidden">
          {/* Subtle red glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c72d28]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 sm:py-28">
            {/* Badge */}
            <div className="mb-8">
              <span
                className="inline-block bg-[#c72d28] text-white text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 font-bold"
                data-testid="coming-soon-badge"
              >
                Upcoming Event
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">
              {/* Title */}
              <div>
                <h3
                  className="text-[min(18vw,140px)] font-black text-white leading-none tracking-tight"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                  data-testid="coming-soon-event-title"
                >
                  VOL.3
                </h3>
                <p
                  className="text-2xl sm:text-3xl font-black text-[#c72d28] uppercase tracking-[0.1em] -mt-2"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  FULL CAPACITY
                </p>
              </div>

              {/* Right side: details + countdown */}
              <div>
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2 text-white/50" data-testid="coming-soon-date">
                    <Calendar className="w-3.5 h-3.5 text-[#c72d28]" />
                    <span className="uppercase tracking-wider text-xs">18th April 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50" data-testid="coming-soon-time">
                    <Clock className="w-3.5 h-3.5 text-[#c72d28]" />
                    <span className="uppercase tracking-wider text-xs">10PM — Until</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50" data-testid="coming-soon-venue">
                    <MapPin className="w-3.5 h-3.5 text-[#c72d28]" />
                    <span className="uppercase tracking-wider text-xs">Shotz, Flic en Flac</span>
                  </div>
                </div>

                <CountdownTimer targetDate={eventDate} />

                <div className="mt-8">
                  <p className="text-white/30 text-sm mb-6" data-testid="coming-soon-text">
                    The biggest night yet. Vol 3 is about one thing — full capacity. Every seat, every corner, every moment taken over.
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
          </div>
        </div>
      </div>
    </section>
  );
}
