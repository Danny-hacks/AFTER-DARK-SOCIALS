import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AccessPassport } from "@/components/access-passport";

export default function AccessPassportPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <AccessPassport />
      <Footer />
    </div>
  );
}
