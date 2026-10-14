import { useEffect, useState } from "react";

/** Days / hours / minutes / seconds until `targetDate`. Shared by AFTR event pages and ACCESS. */
export function CountdownTimer({ targetDate, accent }: { targetDate: Date; accent?: "gold" }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs",  value: timeLeft.hours },
    { label: "Min",  value: timeLeft.minutes },
    { label: "Sec",  value: timeLeft.seconds },
  ];
  const gold = accent === "gold";

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className={`border px-4 sm:px-6 py-4 sm:py-5 min-w-[60px] sm:min-w-[88px] text-center ${
              gold ? "border-[#c9962a]/40 bg-[#c9962a]/[0.04]" : "border-white/20"
            }`}
          >
            <span
              className="text-3xl sm:text-5xl font-black block leading-none"
              style={
                gold
                  ? {
                      fontFamily: "'Bebas Neue', Impact, sans-serif",
                      background: "linear-gradient(135deg,#c9962a,#f5d76e,#b8860b)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }
                  : { fontFamily: "'Bebas Neue', Impact, sans-serif", color: "white" }
              }
            >
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className={`text-[9px] uppercase tracking-[0.25em] mt-2 ${gold ? "text-[#c9962a]/50" : "text-white/30"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
