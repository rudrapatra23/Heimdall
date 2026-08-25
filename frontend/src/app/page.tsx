import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import CoreMechanismSection from '@/app/components/CoreMechanismSection';
import WhyNotForEveryoneSection from '@/app/components/WhyNotForEveryoneSection';
import FinalCTASection from '@/app/components/FinalCTASection';

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="blob-accent absolute top-[-20%] left-[10%] w-[600px] h-[600px] opacity-60" />
        <div className="blob-secondary absolute top-[30%] right-[-10%] w-[500px] h-[500px] opacity-40" />
        <div className="blob-accent absolute bottom-[-10%] left-[40%] w-[400px] h-[400px] opacity-30" />
      </div>

      <div className="relative z-10">
        <Header />
        <HeroSection />
        <CoreMechanismSection />
        <WhyNotForEveryoneSection />
        <FinalCTASection />
        <Footer />
      </div>
    </main>
  );
}