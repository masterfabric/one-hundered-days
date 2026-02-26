import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FeaturedDevelopers } from "@/components/home/FeaturedDevelopers";
import { Testimonials } from "@/components/home/Testimonials";
import { Footer } from "@/components/home/Footer";
import { CursorSpotlight } from "@/components/effects/PremiumEffects";

export default function Home() {
  return (
    <CursorSpotlight>
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Header />
        <main className="flex-1">
          <Hero />
          <StatsSection />
          <FeaturedProjects />
          <FeaturedDevelopers />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </CursorSpotlight>
  );
}
