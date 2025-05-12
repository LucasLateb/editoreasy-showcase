
// Add this to the existing types file to define the check_favorite function
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 'check_favorite',
      params: { user_id_param: string; editor_id_param: string }
    ): Promise<PostgrestResponse<boolean>>;
  }
}
