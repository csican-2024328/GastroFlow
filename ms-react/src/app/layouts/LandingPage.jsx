import { LandingNavbar } from '../../features/landing/components/LandingNavbar.jsx';
import { HeroSection } from '../../features/landing/components/HeroSection.jsx';
import { FeaturedDishesSection } from '../../features/landing/components/FeaturedDishesSection.jsx';
import { QuickReservationSection } from '../../features/landing/components/QuickReservationSection.jsx';

export const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0a08] text-[#f5ede0]">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturedDishesSection />
        <QuickReservationSection />
      </main>
    </div>
  );
};