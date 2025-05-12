
-- Create a function to check if a user has favorited an editor
CREATE OR REPLACE FUNCTION public.check_favorite(user_id_param UUID, editor_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.editor_favorites
    WHERE user_id = user_id_param AND editor_id = editor_id_param
  );
$$;
