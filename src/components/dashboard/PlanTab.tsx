
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Settings } from 'lucide-react';
import { subscriptionPlans, SubscriptionPlan } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/functions-js';

const PlanTab: React.FC = () => {
  const { currentUser, refreshCurrentUserSubscription } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Log currentUser whenever it changes
  useEffect(() => {
    console.log("PlanTab: currentUser updated", currentUser);
  }, [currentUser]);

  const getErrorMessage = async (error: any, defaultMessage: string): Promise<string> => {
    if (error instanceof FunctionsHttpError) {
      if (error.context && typeof error.context === 'object' && 'error' in error.context && typeof error.context.error === 'string') {
        return error.context.error;
      }
      return error.message; 
    } else if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return defaultMessage;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutStatus = params.get('checkout_status');
    const planId = params.get('plan_id');
    console.log("PlanTab: useEffect for checkout_status triggered. Status:", checkoutStatus, "Plan ID:", planId);

    if (checkoutStatus === 'success' && planId) {
      const plan = subscriptionPlans.find(p => p.id === planId);
      const planName = plan ? plan.name : 'votre nouveau plan';
      
      toast.success(`Abonnement réussi ! Votre ${planName} est maintenant actif.`);
      console.log("PlanTab: Checkout success detected, calling refreshCurrentUserSubscription.");
      
      refreshCurrentUserSubscription().catch(err => {
        console.error("PlanTab: Error during post-checkout refreshCurrentUserSubscription:", err);
      });

      navigate(location.pathname, { replace: true });
    } else if (checkoutStatus === 'cancel') {
      toast.info('Le processus d\'abonnement a été annulé.');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, refreshCurrentUserSubscription]); // refreshCurrentUserSubscription is a dependency

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!currentUser) {
      toast.error('User not authenticated. Please re-login.');
      return;
    }
    
    const currentPlanId = currentUser?.subscriptionTier || 'free';
    if (plan.id === currentPlanId) {
        toast.info("This is already your current plan.");
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
      console.error('Error creating checkout session:', error);
      if (error instanceof FunctionsHttpError) {
        console.error('FunctionsHttpError message for create-checkout:', error.message);
        console.error('FunctionsHttpError context for create-checkout:', error.context);
      } else {
        console.error('Non-FunctionsHttpError details for create-checkout:', JSON.stringify(error, null, 2));
      }
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser) {
      toast.error('User not authenticated. Please re-login.');
      return;
    }

    const returnUrl = `${window.location.origin}/dashboard?tab=plan`;

    const loadingToastId = toast.loading('Redirecting to subscription management...');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { returnUrl },
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Could not retrieve customer portal URL.');
      }
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      const message = await getErrorMessage(error, 'Could not retrieve customer portal URL.');
      toast.error(`Failed to open subscription management: ${message}`);
      console.error('Error redirecting to customer portal:', error);
      if (error instanceof FunctionsHttpError) {
        console.error('FunctionsHttpError message for customer-portal:', error.message);
        console.error('FunctionsHttpError context for customer-portal:', error.context);
      } else {
        console.error('Non-FunctionsHttpError details for customer-portal:', JSON.stringify(error, null, 2));
      }
    }
  };

  const currentPlanId = currentUser?.subscriptionTier || 'free';

  let displayedPlans: SubscriptionPlan[] = subscriptionPlans;
  if (currentPlanId === 'premium') {
    displayedPlans = subscriptionPlans.filter(plan => plan.id !== 'free');
  } else if (currentPlanId === 'pro') {
    displayedPlans = subscriptionPlans.filter(plan => plan.id === 'pro');
  }

  const showManageButton = currentPlanId === 'premium' || currentPlanId === 'pro';

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose or manage your plan for video editing needs</p>
      </div>

      {showManageButton && (
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Manage Your Subscription</h3>
          <p className="text-muted-foreground mb-4">
            You can manage your current subscription, update payment methods, or view invoices through our secure portal.
          </p>
          <Button onClick={handleManageSubscription} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Manage Plan
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {displayedPlans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          
          let showPopularBadge = false;
          let applyPopularStyling = false;

          if (currentPlanId === 'premium' && plan.id === 'pro') {
            showPopularBadge = true;
            applyPopularStyling = true;
          } else if (currentPlanId === 'free' && plan.popular && plan.id !== 'free') {
            // If user is 'free', the default popular plan gets badge & styling if it's not 'free'
            showPopularBadge = true;
            applyPopularStyling = true;
          }
          
          // If this plan is the current plan, it should not show "Most Popular" badge
          // or have popular styling, the "Current Plan" styling takes precedence.
          if (isCurrentPlan) {
            showPopularBadge = false;
            applyPopularStyling = false; 
          }

          return (
            <div 
              key={plan.id}
              className={cn(
                "rounded-2xl border p-8 flex flex-col h-full",
                applyPopularStyling ? "shadow-lg ring-2 ring-primary relative z-10 bg-background" : "bg-background/50",
                isCurrentPlan && "border-primary/50 bg-primary/5"
              )}
            >
              {showPopularBadge && (
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
                  onClick={() => handleSubscribe(plan)}
                  className={cn(
                    "w-full", 
                    isCurrentPlan 
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-default"
                      : applyPopularStyling // Use applyPopularStyling for button style as well
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  )}
                  disabled={isCurrentPlan && plan.id !== 'free'}
                >
                  {isCurrentPlan ? 'Current Plan' : (plan.id === 'free' ? 'Switch to Free' : `Subscribe to ${plan.name}`)}
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
