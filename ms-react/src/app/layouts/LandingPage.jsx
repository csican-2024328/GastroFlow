import { LandingNavbar } from '../../features/landing/components/LandingNavbar.jsx';
import { HeroSection } from '../../features/landing/components/HeroSection.jsx';
import { FeaturedDishesSection } from '../../features/landing/components/FeaturedDishesSection.jsx';
import { QuickReservationSection } from '../../features/landing/components/QuickReservationSection.jsx';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--gf-cream)] text-[var(--gf-graphite)] overflow-x-hidden">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturedDishesSection />
        <QuickReservationSection />
      </main>
    </div>
  );
};