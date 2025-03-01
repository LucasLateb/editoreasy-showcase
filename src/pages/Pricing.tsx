
import React from 'react';
import Navbar from '@/components/Navbar';
import PricingPlans from '@/components/PricingPlans';
import { Footer } from '@/components/ui/sidebar';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <PricingPlans />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
