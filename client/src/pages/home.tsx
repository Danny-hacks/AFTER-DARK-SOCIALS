import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import EventDetails from "@/components/event-details";
import TicketSection from "@/components/ticket-section";
import LocationSection from "@/components/location-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <EventDetails />
      <TicketSection />
      <LocationSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
