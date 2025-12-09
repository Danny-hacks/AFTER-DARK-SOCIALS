import HeroSection from "@/components/hero-section";
import PastEvents from "@/components/past-events";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <PastEvents />
      <ContactSection />
      <Footer />
    </div>
  );
}
