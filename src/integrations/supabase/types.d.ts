// Add this to the existing types file to define the check_favorite function
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 'check_favorite',
      params: { user_id_param: string; editor_id_param: string }
    ): Promise<PostgrestResponse<boolean>>;
    
    // Keep the existing RPC function types
    rpc<T = any>(
      fn: 'check_profile_like' | 'check_video_like' | 'has_premium_access' | 'record_portfolio_view' | 'record_video_view',
      params?: Record<string, any>
    ): Promise<PostgrestResponse<T>>;
  }
}
