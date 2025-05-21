
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { subscriptionPlans, SubscriptionPlan } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/functions-js';

const PricingPlans: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const getErrorMessage = async (error: any, defaultMessage: string): Promise<string> => {
    if (error instanceof FunctionsHttpError) {
      // Check if context has a more specific error message
      if (error.context && typeof error.context === 'object' && 'error' in error.context && typeof error.context.error === 'string') {
        return error.context.error;
      }
      return error.message; // Fallback to the general FunctionsHttpError message
    } else if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return defaultMessage;
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      navigate('/register');
      return;
    }

    if (!currentUser) {
      toast.info('Please log in or register to subscribe to a plan.');
      navigate('/login');
      return;
    }

    const planPriceInCents = plan.price * 100;
    const successUrl = `${window.location.origin}/dashboard?tab=plan&checkout_status=success&plan_id=${plan.id}`;
    const cancelUrl = `${window.location.origin}/dashboard?tab=plan&checkout_status=cancel`;

    const loadingToastId = toast.loading('Redirecting to checkout...');
    try {
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
        throw error;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Could not retrieve checkout session URL.');
      }
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      const message = await getErrorMessage(error, 'Could not process your subscription request.');
      toast.error(`Failed to create checkout session: ${message}`);
      console.error('Error creating checkout session:', error); // Logs the whole error object
      if (error instanceof FunctionsHttpError) {
        console.error('FunctionsHttpError message for create-checkout:', error.message);
        console.error('FunctionsHttpError context for create-checkout:', error.context);
      } else {
        console.error('Non-FunctionsHttpError details for create-checkout:', JSON.stringify(error, null, 2));
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground text-lg">
            Select the perfect plan to showcase your video editing skills and attract clients.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan, index) => {
            const userTier = currentUser?.subscriptionTier;
            let isHighlightedAsPopular = false;

            if (userTier === 'premium' && plan.id === 'pro') {
              isHighlightedAsPopular = true;
            } else if (userTier !== 'premium') { // Covers free, pro, or not logged in
              if (plan.popular && plan.id !== userTier) {
                isHighlightedAsPopular = true;
              }
            }
            
            // Ensure Pro plan itself is not highlighted if user is already Pro
            if (userTier === 'pro' && plan.id === 'pro') {
              isHighlightedAsPopular = false;
            }

            return (
              <div 
                key={plan.id}
                className={cn(
                  "rounded-2xl backdrop-blur-sm border border-border p-8 flex flex-col h-full animate-fade-in opacity-0",
                  isHighlightedAsPopular ? "shadow-lg ring-2 ring-primary relative z-10 bg-background" : "bg-background/50"
                )}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                {isHighlightedAsPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                    Most Popular
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
                    onClick={() => handleSubscribe(plan)}
                    className={cn(
                      "w-full", 
                      isHighlightedAsPopular 
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    )}
                  >
                    {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
