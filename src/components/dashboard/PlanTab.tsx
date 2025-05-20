
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { subscriptionPlans } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const PlanTab: React.FC = () => {
  const { currentUser } = useAuth();

  const handleSubscribe = (planId: string) => {
    toast.info(`Subscription to ${planId} plan will be implemented soon.`);
  };

  // Get user's current plan
  const currentPlan = currentUser?.subscriptionTier || 'free';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose the perfect plan for your video editing needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <div 
              key={plan.id}
              className={cn(
                "rounded-2xl border p-8 flex flex-col h-full",
                plan.popular ? "shadow-lg ring-2 ring-primary relative z-10 bg-background" : "bg-background/50",
                isCurrentPlan && "border-primary/50 bg-primary/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-4 right-8 bg-green-600 text-white rounded-full px-4 py-1 text-sm font-medium">
                  Current Plan
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="ml-1 text-muted-foreground">/month</span>
                  )}
                </div>
              </div>
              
              <ul className="mt-8 space-y-4 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <p className="ml-3 text-muted-foreground">{feature}</p>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={cn(
                    "w-full", 
                    isCurrentPlan 
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-default"
                      : plan.popular 
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  )}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanTab;
