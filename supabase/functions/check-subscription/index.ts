
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const getPlanIdFromPriceProduct = (price: Stripe.Price): string | null => {
  if (!price || !price.product) {
    logStep("getPlanIdFromPriceProduct: Price or price.product is null/undefined", { price });
    return null;
  }
  if (typeof price.product === 'string') {
    logStep("getPlanIdFromPriceProduct: price.product is a string (ID), not an expanded object. Cannot get metadata.", { productId: price.product });
    // Potentially fetch the product by ID if needed, but for now, this indicates an issue with expansion.
    return null; 
  }
  // Ensure metadata exists on product or price
  const planId = price.product?.metadata?.plan_id || price.metadata?.plan_id || null;
  logStep("getPlanIdFromPriceProduct: Extracted plan_id", { 
    productMetadataPlanId: price.product?.metadata?.plan_id,
    priceMetadataPlanId: price.metadata?.plan_id,
    finalPlanId: planId 
  });
  return planId;
};

serve(async (req: Request) => {
  logStep("Function started");
  if (req.method === "OPTIONS") {
    logStep("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  const authSupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const serviceSupabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    logStep("Authenticating user");
    const { data: { user }, error: userError } = await authSupabaseClient.auth.getUser();
    if (userError || !user) throw new Error(`User not authenticated: ${userError?.message}`);
    if (!user.email || !user.id) throw new Error("User email or ID not found.");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    logStep("Looking up Stripe customer by email", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found", { email: user.email });
      await serviceSupabaseClient.from("profiles").update({ subscription_tier: 'free' }).eq('id', user.id);
      logStep("Updated profile to 'free' as no Stripe customer found.");
      const { data: existingSub, error: selectError } = await serviceSupabaseClient.from("subscribers").select("id").eq("user_id", user.id).maybeSingle();
      if (selectError) logStep("Error selecting subscriber for cleanup", {error: selectError.message});
      if (existingSub) {
        await serviceSupabaseClient.from("subscribers").update({ subscription_status: 'inactive', subscription_tier: null, current_period_end: null }).eq('id', existingSub.id);
        logStep("Updated existing subscriber record to inactive as no Stripe customer found.");
      }
      return new Response(JSON.stringify({ subscribed: false, subscription_tier: null, current_period_end: null, status: 'inactive' }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
    const customer = customers.data[0];
    logStep("Stripe customer found", { customerId: customer.id });

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id, status: "all", limit: 10, expand: ["data.items.data.price.product"],
    });
    logStep("Fetched subscriptions from Stripe", { count: subscriptions.data.length });

    let subToProcess = subscriptions.data.find(s => s.status === 'active') || subscriptions.data.find(s => s.status === 'trialing');
    logStep("Initial subToProcess (active/trialing)", { subId: subToProcess?.id, status: subToProcess?.status });

    if (!subToProcess) {
      const mostRecentSub = subscriptions.data.sort((a,b) => b.created - a.created)[0];
      logStep("Most recent subscription (if no active/trialing)", { subId: mostRecentSub?.id, status: mostRecentSub?.status, current_period_end: mostRecentSub ? new Date(mostRecentSub.current_period_end * 1000) : null });
      if (mostRecentSub && (mostRecentSub.status === 'past_due' || (mostRecentSub.status === 'canceled' && mostRecentSub.current_period_end * 1000 > Date.now()))) {
        subToProcess = mostRecentSub;
        logStep("Found non-active but relevant subscription (past_due or recently canceled but still in period)", { subId: subToProcess.id, status: subToProcess.status });
      }
    }

    if (subToProcess) {
      logStep("Processing subscription", { subId: subToProcess.id, status: subToProcess.status, items: subToProcess.items.data.length });
      
      const firstItemPrice = subToProcess.items.data[0]?.price;
      if (!firstItemPrice) {
        logStep("ERROR: Subscription item price is missing.", { subId: subToProcess.id });
        throw new Error("Subscription item price is missing.");
      }
      logStep("Subscription item price object", { priceId: firstItemPrice.id, product: firstItemPrice.product });

      const planId = getPlanIdFromPriceProduct(firstItemPrice);
      logStep("Determined planId from subscription", { planId });

      const subscriptionPayload = {
        email: user.email, stripe_customer_id: customer.id, stripe_subscription_id: subToProcess.id,
        subscription_status: subToProcess.status, subscription_tier: planId,
        current_period_end: new Date(subToProcess.current_period_end * 1000).toISOString(),
      };
      logStep("Subscriber payload for DB", subscriptionPayload);

      const { data: existingSubRec, error: selectErr } = await serviceSupabaseClient.from("subscribers").select("id").eq("user_id", user.id).maybeSingle();
      if (selectErr) throw new Error(`Error selecting subscriber: ${selectErr.message}`);

      if (existingSubRec) {
        logStep("Updating existing subscriber record", { id: existingSubRec.id });
        const { error } = await serviceSupabaseClient.from("subscribers").update(subscriptionPayload).eq("id", existingSubRec.id);
        if (error) throw new Error(`Error updating subscriber: ${error.message}`);
      } else {
        logStep("Inserting new subscriber record", { userId: user.id });
        const { error } = await serviceSupabaseClient.from("subscribers").insert({ ...subscriptionPayload, user_id: user.id });
        if (error) throw new Error(`Error inserting subscriber: ${error.message}`);
      }
      
      const isEffectivelySubscribed = ['active', 'trialing', 'past_due'].includes(subToProcess.status) || (subToProcess.status === 'canceled' && subToProcess.current_period_end * 1000 > Date.now());
      logStep("Calculated isEffectivelySubscribed", { isEffectivelySubscribed });
      
      const profileTierToSet = isEffectivelySubscribed && planId ? planId : 'free';
      logStep("Determined profileTierToSet", { profileTierToSet, planId, isEffectivelySubscribed });

      logStep("Updating profiles table", { userId: user.id, tier: profileTierToSet });
      const { error: profileErr } = await serviceSupabaseClient.from("profiles").update({ subscription_tier: profileTierToSet }).eq('id', user.id);
      if (profileErr) {
        logStep("Error updating profile (non-fatal)", { error: profileErr.message });
        // Even if profile update fails, respond with what Stripe says.
        // Client will call fetchAndUpdateUser which will get the (potentially stale) profile.
      } else {
        logStep("Profile table updated successfully", { userId: user.id, tier: profileTierToSet });
      }

      return new Response(JSON.stringify({
        subscribed: isEffectivelySubscribed, subscription_tier: planId, // Return planId from Stripe, not profileTierToSet
        current_period_end: new Date(subToProcess.current_period_end * 1000).toISOString(), status: subToProcess.status,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

    } else {
      logStep("No relevant subscription found after checking all conditions", { customerId: customer.id });
      const { data: existingSubRec, error: selectErr } = await serviceSupabaseClient.from("subscribers").select("id").eq("user_id", user.id).maybeSingle();
      if (selectErr) logStep("Error selecting subscriber for inactive update", {error: selectErr.message});
      if (existingSubRec) {
        await serviceSupabaseClient.from("subscribers").update({ subscription_status: 'inactive', subscription_tier: null, current_period_end: null }).eq('id', existingSubRec.id);
        logStep("Updated existing subscriber record to inactive as no relevant Stripe subscription found.");
      }
      await serviceSupabaseClient.from("profiles").update({ subscription_tier: 'free' }).eq('id', user.id);
      logStep("Updated profile to 'free' as no relevant Stripe subscription found.");
      return new Response(JSON.stringify({ subscribed: false, subscription_tier: null, current_period_end: null, status: 'inactive' }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
  } catch (error) {
    logStep("Error in function", { message: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

