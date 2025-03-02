
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { subscriptionPlans } from '@/types';
import { cn } from '@/lib/utils';

const PricingPlans: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Choose Your Plan</h2>
          <p className="text-gray-300 text-lg">
            Select the perfect plan to showcase your video editing skills and attract clients.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan, index) => (
            <div 
              key={plan.id}
              className={cn(
                "rounded-2xl backdrop-blur-sm border p-8 flex flex-col h-full animate-fade-in opacity-0",
                plan.popular 
                  ? "shadow-lg ring-2 ring-primary relative z-10 bg-[#1a1a1a] border-primary/30" 
                  : "bg-[#1a1a1a]/70 border-gray-800"
              )}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-gray-400 mt-2">{plan.description}</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="ml-1 text-gray-400">/month</span>
                  )}
                </div>
              </div>
              
              <ul className="mt-8 space-y-4 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <p className="ml-3 text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link to="/register">
                  <Button
                    className={cn(
                      "w-full", 
                      plan.popular 
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                        : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    )}
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
