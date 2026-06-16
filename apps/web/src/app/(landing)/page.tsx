import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { WeeklyMenu } from '@/components/landing/weekly-menu';
import { Differentials } from '@/components/landing/differentials';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQ } from '@/components/landing/faq';
import { FinalCTA } from '@/components/landing/final-cta';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WeeklyMenu />
      <Differentials />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
