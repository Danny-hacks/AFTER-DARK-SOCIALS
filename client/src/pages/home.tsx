import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ServicesSection from "@/components/service-section";
import AccessSection from "@/components/access-section";
import GalleryPreview from "@/components/gallery-preview";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

function MarqueeTicker() {
  const items = [
    "AFTR",
    "THE RAVE THAT KEEPS THE CITY AWAKE",
    "MAURITIUS",
    "PRIVATE BOOKINGS",
    "CORPORATE EVENTS",
    "BRAND ACTIVATIONS",
    "ACCESS",
    "EXCLUSIVE LOUNGE EXPERIENCE",
    "AFTER DARK SOCIALS",
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
      <ServicesSection />
      <AccessSection />
      <GalleryPreview />
      <ContactSection />
      <Footer />
    </div>
  );
}
