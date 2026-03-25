import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ComingSoonBanner from "@/components/coming-soon-banner";
import AboutSection from "@/components/about-section";
import PastEvents from "@/components/past-events";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

function MarqueeTicker() {
  const items = [
    "AFTR", "THE RAVE THAT KEEPS THE CITY AWAKE", "MAURITIUS",
    "AFTR VOL.3", "FULL CAPACITY", "18 APRIL 2026",
    "AFTR", "SHOTZ · FLIC EN FLAC", "AFTER DARK SOCIAL",
  ];
  const repeated = [...items, ...items];

  return (
    <div className="bg-[#c72d28] py-3 overflow-hidden flex whitespace-nowrap border-y border-[#a82421]">
      <div className="flex animate-marquee gap-12 will-change-transform">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="text-white text-xs font-bold uppercase tracking-[0.3em] flex-shrink-0 flex items-center gap-12"
          >
            {item}
            <span className="text-white/40 text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <HeroSection />
      <MarqueeTicker />
      <AboutSection />
      <ComingSoonBanner />
      <PastEvents />
      <ContactSection />
      <Footer />
    </div>
  );
}
