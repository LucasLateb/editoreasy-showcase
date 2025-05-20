
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req: Request) => {
  logStep("Function started");
  if (req.method === "OPTIONS") {
    logStep("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    logStep("Authenticating user");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      logStep("Authentication failed", { error: userError?.message });
      throw new Error("User not authenticated.");
    }
    if (!user.email) {
      logStep("User email not found");
      throw new Error("User email is required for Stripe customer portal.");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });
    
    const { returnUrl } = await req.json();
    if (!returnUrl) {
        logStep("Missing returnUrl in request body");
        throw new Error("Missing required parameter: returnUrl.");
    }
    logStep("Request body parsed", { returnUrl });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    logStep("Looking up Stripe customer by email", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found for this user", { email: user.email });
      // It's possible a user might try to access portal before ever subscribing
      // Depending on UX, you might redirect them to pricing or show an error.
      throw new Error("No Stripe customer account found for this user. Please subscribe to a plan first.");
    }
    const customerId = customers.data[0].id;
    logStep("Stripe customer found", { customerId });

    logStep("Creating Stripe Billing Portal session");
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    logStep("Stripe Billing Portal session created", { sessionId: portalSession.id });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error in function", { message: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
