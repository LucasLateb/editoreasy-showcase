import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const getPlanIdFromPriceProduct = (price: Stripe.Price): string | null => {
  if (price && typeof price.product === 'object' && price.product !== null) {
    const product = price.product as Stripe.Product;
    return product.metadata?.plan_id || price.metadata?.plan_id || null;
  } else if (price) {
    return price.metadata?.plan_id || null;
  }
  return null;
};

serve(async (req: Request) => {
  const requestHeadersForLogging: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    requestHeadersForLogging[key] = value;
  });
  logStep(`Function invoked (top level)`, { 
    method: req.method, 
    url: req.url, 
    headers: requestHeadersForLogging 
  });

  if (req.method === "OPTIONS") {
    logStep("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !stripeSecretKey) {
    const missingVars = [
      !supabaseUrl && "SUPABASE_URL",
      !supabaseAnonKey && "SUPABASE_ANON_KEY",
      !supabaseServiceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
      !stripeSecretKey && "STRIPE_SECRET_KEY",
    ].filter(Boolean).join(", ");
    logStep("CRITICAL: Missing environment variables", { missing: missingVars });
    throw new Error(`Missing environment variables: ${missingVars}`);
  }
  logStep("Environment variables seem present.");

  const authSupabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    { 
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
      auth: { persistSession: false } 
    }
  );
  logStep("Auth Supabase client initialized.");

  const serviceSupabaseClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  logStep("Service Supabase client initialized.");

  const stripe = new Stripe(stripeSecretKey, { 
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient() // Recommended for Deno
  });
  logStep("Stripe client initialized.");

  logStep("Authenticating user via authSupabaseClient.auth.getUser()");
  const { data: { user }, error: userError } = await authSupabaseClient.auth.getUser();
  
  if (userError) {
    logStep("User authentication error", { message: userError.message, status: (userError as any).status });
    if ((userError as any).status === 401 || (userError as any).message.toLowerCase().includes('invalid token')) {
      return new Response(JSON.stringify({ error: "User not authenticated or session invalid. Please log in again.", code: "AUTH_INVALID_TOKEN" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 });
    }
    throw new Error(`User authentication failed: ${userError.message}`);
  }
  if (!user) {
    logStep("User object is null after getUser call, despite no error.");
    return new Response(JSON.stringify({ error: "User authentication failed: No user object. Please log in again.", code: "AUTH_NO_USER" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 });
  }
  if (!user.email || !user.id) {
    logStep("User email or ID missing from authenticated user object", { user });
    throw new Error("Authenticated user object is missing email or ID.");
  }
  logStep("User authenticated successfully", { userId: user.id, email: user.email });

  logStep("Looking up Stripe customer by email", { email: user.email });
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });

  if (customers.data.length === 0) {
    logStep("No Stripe customer found", { email: user.email });
    await serviceSupabaseClient.from("profiles").update({ subscription_tier: 'free' }).eq('id', user.id);
    const { data: existingSub, error: selectError } = await serviceSupabaseClient.from("subscribers").select("id").eq("user_id", user.id).maybeSingle();
    if (selectError) logStep("Error selecting subscriber for cleanup", {error: selectError.message});
    if (existingSub) {
      await serviceSupabaseClient.from("subscribers").update({ subscription_status: 'inactive', subscription_tier: null, current_period_end: null, stripe_customer_id: null, stripe_subscription_id: null }).eq('id', existingSub.id);
    }
    return new Response(JSON.stringify({ subscribed: false, subscription_tier: null, current_period_end: null, status: 'inactive' }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  }
  const customer = customers.data[0];
  logStep("Stripe customer found", { customerId: customer.id });

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id, status: "all", limit: 10, expand: ["data.items.data.price.product"],
  });

  let subToProcess = subscriptions.data.find(s => s.status === 'active') || subscriptions.data.find(s => s.status === 'trialing');
  if (!subToProcess) {
    const mostRecentSub = subscriptions.data
      .filter(s => s.status === 'past_due' || (s.status === 'canceled' && s.current_period_end * 1000 > Date.now()))
      .sort((a,b) => b.created - a.created)[0];
    if (mostRecentSub) {
      subToProcess = mostRecentSub;
      logStep("Found non-active but relevant subscription", { subId: subToProcess.id, status: subToProcess.status });
    }
  }

  if (subToProcess) {
    logStep("Processing subscription", { subId: subToProcess.id, status: subToProcess.status });
    const planId = getPlanIdFromPriceProduct(subToProcess.items.data[0]?.price);
    logStep("Extracted planId from subscription item", { planId: planId || "N/A" });

    const subscriptionPayload = {
      user_id: user.id,
      email: user.email!,
      stripe_customer_id: customer.id, 
      stripe_subscription_id: subToProcess.id,
      subscription_status: subToProcess.status, 
      subscription_tier: planId,
      current_period_end: new Date(subToProcess.current_period_end * 1000).toISOString(),
    };

    const { data: existingSubRec, error: selectErr } = await serviceSupabaseClient.from("subscribers").select("id").eq("user_id", user.id).maybeSingle();
    if (selectErr) {
      logStep("Error selecting subscriber record for upsert", { error: selectErr.message });
      throw new Error(`Error selecting subscriber: ${selectErr.message}`);
    }

    if (existingSubRec) {
      logStep("Updating existing subscriber record", { id: existingSubRec.id, payload: subscriptionPayload });
      const { error } = await serviceSupabaseClient.from("subscribers").update(subscriptionPayload).eq("id", existingSubRec.id);
      if (error) {
        logStep("Error updating subscriber record", { error: error.message });
        throw new Error(`Error updating subscriber: ${error.message}`);
      }
    } else {
      logStep("Inserting new subscriber record", { userId: user.id, payload: subscriptionPayload });
      const { error } = await serviceSupabaseClient.from("subscribers").insert(subscriptionPayload);
      if (error) {
        logStep("Error inserting subscriber record", { error: error.message });
        throw new Error(`Error inserting subscriber: ${error.message}`);
      }
    }
    
    const isEffectivelySubscribed = ['active', 'trialing', 'past_due'].includes(subToProcess.status) || (subToProcess.status === 'canceled' && subToProcess.current_period_end * 1000 > Date.now());
    const profileTierToSet = isEffectivelySubscribed ? (planId || 'free') : 'free';

    logStep("Updating profiles table", { userId: user.id, tier: profileTierToSet });
    const { error: profileErr } = await serviceSupabaseClient.from("profiles").update({ subscription_tier: profileTierToSet }).eq('id', user.id);
    if (profileErr) logStep("Error updating profile (non-fatal for function response)", { error: profileErr.message });

    return new Response(JSON.stringify({
      subscribed: isEffectivelySubscribed, subscription_tier: planId,
      current_period_end: new Date(subToProcess.current_period_end * 1000).toISOString(), status: subToProcess.status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } else {
    logStep("No relevant (active/trialing/recent-canceled-active-period) subscription found", { customerId: customer.id });
    const { data: existingSubRec, error: selectErr } = await serviceSupabaseClient.from("subscribers").select("id").eq("user_id", user.id).maybeSingle();
    if (selectErr) logStep("Error selecting subscriber for inactive update", {error: selectErr.message});
    
    if (existingSubRec) {
      await serviceSupabaseClient.from("subscribers").update({ 
          subscription_status: 'inactive', 
          subscription_tier: null, 
          current_period_end: null,
          // stripe_subscription_id: null // Keep stripe_customer_id, but clear subscription specific fields
      }).eq('id', existingSubRec.id);
      logStep("Updated existing subscriber to inactive", { subscriberId: existingSubRec.id });
    } else {
      await serviceSupabaseClient.from("subscribers").insert({
        user_id: user.id,
        email: user.email!,
        stripe_customer_id: customer.id,
        subscription_status: 'inactive',
      });
      logStep("Inserted new inactive subscriber record", { userId: user.id });
    }
    await serviceSupabaseClient.from("profiles").update({ subscription_tier: 'free' }).eq('id', user.id);
    logStep("Updated profile to 'free'", { userId: user.id });
    return new Response(JSON.stringify({ subscribed: false, subscription_tier: null, current_period_end: null, status: 'inactive' }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  }
});
