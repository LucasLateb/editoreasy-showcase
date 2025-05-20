
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
      throw new Error("User email not found.");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planId, planName, planPriceInCents, successUrl, cancelUrl } = await req.json();
    logStep("Request body parsed (raw)", { planId, planName, planPriceInCents, successUrl, cancelUrl });

    if (!planId || !planName || typeof planPriceInCents !== 'number' || !successUrl || !cancelUrl) {
      logStep("Missing parameters in request body");
      throw new Error("Missing or invalid required parameters: planId (string), planName (string), planPriceInCents (number), successUrl (string), cancelUrl (string).");
    }

    const roundedPlanPriceInCents = Math.round(planPriceInCents);
    logStep("Request body parsed (rounded price)", { planId, planName, planPriceInCents: roundedPlanPriceInCents, successUrl, cancelUrl });


    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
      // Enabling telemetry helps Stripe improve their library.
      // You can disable it if you prefer by setting telemetry: false
      telemetry: true, 
    });

    logStep("Looking up Stripe customer by email", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer, will be created during checkout");
    }

    logStep("Creating Stripe Checkout session");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur", // Assuming currency is EUR, adjust if necessary
            product_data: {
              name: planName,
              metadata: { plan_id: planId }
            },
            unit_amount: roundedPlanPriceInCents, // Use the rounded price
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    logStep("Stripe Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error in function", { message: error.message, stack: error.stack, type: error.type, code: error.code, statusCode: error.statusCode });
    
    let statusCode = 500;
    let errorMessage = error.message || "An unknown error occurred while creating checkout session.";

    if (error.type === 'StripeInvalidRequestError') {
      statusCode = error.statusCode || 400; // Stripe often sends statusCode with errors
      errorMessage = `Stripe API Error: ${error.message}`;
    } else if (errorMessage === "User not authenticated.") {
      statusCode = 401;
    } else if (errorMessage === "User email not found." || errorMessage.startsWith("Missing or invalid required parameters")) {
      statusCode = 400;
    }
    // For other errors, default to 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});

