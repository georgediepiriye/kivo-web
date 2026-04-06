import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import VibeCTA from "@/components/landing/VibeCTA";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/NavBar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <VibeCTA />
      <MobileNav />
      <Footer />
    </main>
  );
}
