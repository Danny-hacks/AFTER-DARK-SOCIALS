import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactSection from "@/components/contact-section";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20 sm:pt-24">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
