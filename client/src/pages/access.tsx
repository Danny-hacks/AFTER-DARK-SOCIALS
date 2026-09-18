import { usePageTitle } from "@/hooks/use-page-title";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AccessPassport } from "@/components/access-passport";

export default function AccessPage() {
  usePageTitle("ACCESS");
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <AccessPassport />
      <Footer />
    </div>
  );
}