
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink } from 'lucide-react';
import { subscriptionPlans } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PlanTab: React.FC = () => {
  const { currentUser, subscriptionDetails, refreshSubscriptionDetails, loadingSubscription } = useAuth();
  const [isLoadingSubscribe, setIsLoadingSubscribe] = useState<string | null>(null); // planId or 'manage'
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus) {
      if (checkoutStatus === 'success') {
        toast.success('Abonnement réussi !', {
          description: 'Votre abonnement a été activé.',
        });
        refreshSubscriptionDetails(); // Refresh subscription details
      } else if (checkoutStatus === 'cancel') {
        toast.info('Souscription annulée', {
          description: 'Le processus de souscription a été annulé.',
        });
      }
      // Clean up URL params
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refreshSubscriptionDetails, navigate]);

  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      toast.error("Veuillez vous connecter pour vous abonner.");
      return;
    }
    setIsLoadingSubscribe(planId);
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        toast.error("Plan non trouvé.");
        setIsLoadingSubscribe(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: plan.id,
          planName: plan.name,
          planPriceInCents: Math.round(plan.price * 100), // Stripe expects cents
          successUrl: `${window.location.origin}/dashboard?tab=plan&checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard?tab=plan&checkout=cancel`,
        },
      });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        toast.error("Erreur lors de la création de la session de paiement.", { description: error.message });
      } else if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error("Impossible de rediriger vers Stripe. Session non créée.");
      }
    } catch (e: any) {
      console.error('Subscription Error:', e);
      toast.error("Une erreur s'est produite.", { description: e.message });
    } finally {
      setIsLoadingSubscribe(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser) {
      toast.error("Veuillez vous connecter pour gérer votre abonnement.");
      return;
    }
    setIsLoadingSubscribe('manage');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          returnUrl: `${window.location.origin}/dashboard?tab=plan`,
        },
      });

      if (error) {
        console.error('Stripe Portal Error:', error);
        toast.error("Erreur d'accès au portail de gestion.", { description: error.message });
      } else if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Customer Portal
      } else {
        toast.error("Impossible de rediriger vers le portail de gestion Stripe.");
      }
    } catch (e: any) {
      console.error('Manage Subscription Error:', e);
      toast.error("Une erreur s'est produite.", { description: e.message });
    } finally {
      setIsLoadingSubscribe(null);
    }
  };

  const currentPlanId = subscriptionDetails?.isSubscribed ? subscriptionDetails.tier : currentUser?.subscriptionTier || 'free';
  
  const isEffectivelySubscribed = subscriptionDetails?.isSubscribed ?? false;
  // Show manage button if effectively subscribed to any paid plan.
  const showManageButton = isEffectivelySubscribed && currentPlanId !== 'free';


  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Abonnements</h2>
          <p className="text-muted-foreground">Choisissez le plan parfait pour vos besoins.</p>
        </div>
        {showManageButton && (
          <Button 
            onClick={handleManageSubscription}
            disabled={isLoadingSubscribe === 'manage' || loadingSubscription}
            variant="outline"
          >
            {isLoadingSubscribe === 'manage' ? 'Chargement...' : 'Gérer mon abonnement'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {loadingSubscription && <p>Vérification du statut de l'abonnement...</p>}

      {!loadingSubscription && subscriptionDetails && (
        <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
          <h3 className="font-semibold text-lg">Statut de votre abonnement</h3>
          <p>Plan actuel : <span className="font-medium">{subscriptionPlans.find(p => p.id === (subscriptionDetails.tier || 'free'))?.name || 'N/A'}</span></p>
          <p>Statut : <span className="font-medium">{subscriptionDetails.status || 'N/A'}</span></p>
          {subscriptionDetails.currentPeriodEnd && (
            <p>Prochaine facturation / Fin de période : <span className="font-medium">{new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}</span></p>
          )}
           {!subscriptionDetails.isSubscribed && currentPlanId !== 'free' && subscriptionDetails.status === 'canceled' && subscriptionDetails.currentPeriodEnd && new Date(subscriptionDetails.currentPeriodEnd) > new Date() && (
            <p className="text-orange-600">Votre abonnement est annulé mais reste actif jusqu'au {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}.</p>
          )}
          {!subscriptionDetails.isSubscribed && currentPlanId === 'free' && (
            <p>Vous utilisez actuellement le plan gratuit.</p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => {
          // Use subscriptionDetails.tier if available, otherwise fallback to currentUser.subscriptionTier
          const isCurrentActivePlan = currentPlanId === plan.id;
          
          return (
            <div 
              key={plan.id}
              className={cn(
                "rounded-2xl border p-8 flex flex-col h-full",
                plan.popular ? "shadow-lg ring-2 ring-primary relative z-10 bg-background" : "bg-background/50",
                isCurrentActivePlan && isEffectivelySubscribed && "border-primary/50 bg-primary/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                  Le plus populaire
                </div>
              )}
              
              {isCurrentActivePlan && isEffectivelySubscribed && (
                <div className="absolute -top-4 right-8 bg-green-600 text-white rounded-full px-4 py-1 text-sm font-medium">
                  Plan Actuel
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
                
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold">
                    {plan.price > 0 ? `${plan.price}€` : 'Gratuit'}
                  </span>
                  {plan.price > 0 && (
                    <span className="ml-1 text-muted-foreground">/mois</span>
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
                {plan.id === 'free' ? (
                  <Button
                    className={cn("w-full", isCurrentActivePlan && !isEffectivelySubscribed ? "bg-green-600 hover:bg-green-700" : "bg-secondary hover:bg-secondary/80")}
                    disabled={isCurrentActivePlan && !isEffectivelySubscribed}
                  >
                    {isCurrentActivePlan && !isEffectivelySubscribed ? 'Plan Actuel (Gratuit)' : 'Utiliser Gratuitement'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={cn(
                      "w-full", 
                      isCurrentActivePlan && isEffectivelySubscribed
                        ? "bg-green-600 hover:bg-green-700 text-white cursor-default" // Style for current active paid plan
                        : plan.popular 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    )}
                    disabled={(isLoadingSubscribe === plan.id) || (isCurrentActivePlan && isEffectivelySubscribed) || loadingSubscription}
                  >
                    {isLoadingSubscribe === plan.id ? 'Chargement...' : (isCurrentActivePlan && isEffectivelySubscribed ? 'Plan Actuel' : 'Souscrire')}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanTab;

