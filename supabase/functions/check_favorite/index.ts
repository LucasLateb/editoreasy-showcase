
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the provided auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Parse the request body
    const { user_id_param, editor_id_param } = await req.json();

    // Validate parameters
    if (!user_id_param || !editor_id_param) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if the favorite relationship exists
    const { data, error } = await supabaseClient
      .from('editor_favorites')
      .select('*')
      .eq('user_id', user_id_param)
      .eq('editor_id', editor_id_param)
      .single();

    if (error && error.code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error('Error checking favorite status:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(!!data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
