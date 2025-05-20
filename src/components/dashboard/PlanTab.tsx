
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { subscriptionPlans, SubscriptionPlan } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client'; // Added supabase import

const PlanTab: React.FC = () => {
  const { currentUser } = useAuth();

  const handleSubscribe = async (plan: SubscriptionPlan) => { // Changed planId to plan object
    if (!currentUser) { // Should not happen in dashboard, but good check
      toast.error('User not authenticated. Please re-login.');
      return;
    }
    
    const currentPlanId = currentUser?.subscriptionTier || 'free';
    if (plan.id === currentPlanId) {
        toast.info("This is already your current plan.");
        return;
    }

    const planPriceInCents = plan.price * 100;
    // Success/Cancel URLs could point back to the dashboard or a specific confirmation page
    const successUrl = `${window.location.origin}/dashboard?tab=plan&checkout_status=success&plan_id=${plan.id}`;
    const cancelUrl = `${window.location.origin}/dashboard?tab=plan&checkout_status=cancel`;

    try {
      toast.loading('Redirecting to checkout...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          planName: plan.name,
          planPriceInCents,
          successUrl,
          cancelUrl,
        },
      });

      if (error) {
        throw error; // Supabase client throws on error, this will be caught
      }

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        throw new Error('Could not retrieve checkout session URL.');
      }
    } catch (error: any) {
      toast.dismiss(); // Dismiss loading toast
      toast.error(`Failed to create checkout session: ${error.message}`);
      console.error('Error creating checkout session:', error);
    }
  };

  const currentPlanId = currentUser?.subscriptionTier || 'free';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose the perfect plan for your video editing needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          
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
                  onClick={() => handleSubscribe(plan)} // Pass the whole plan object
                  className={cn(
                    "w-full", 
                    isCurrentPlan 
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-default"
                      : plan.popular 
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  )}
                  disabled={isCurrentPlan && plan.id !== 'free'} // Allow 'subscribing' to free even if current
                >
                  {isCurrentPlan ? 'Current Plan' : (plan.id === 'free' ? 'Switch to Free' : 'Subscribe')}
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

