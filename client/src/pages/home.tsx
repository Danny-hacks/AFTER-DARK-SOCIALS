import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ComingSoonBanner from "@/components/coming-soon-banner";
import AboutSection from "@/components/about-section";
import PastEvents from "@/components/past-events";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ComingSoonBanner />
      <AboutSection />
      <PastEvents />
      <ContactSection />
      <Footer />
    </div>
  );
}
