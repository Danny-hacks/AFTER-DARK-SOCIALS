import { usePageTitle } from "@/hooks/use-page-title";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactSection from "@/components/contact-section";

export default function ContactPage() {
  usePageTitle("Contact");
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 sm:pt-32">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
