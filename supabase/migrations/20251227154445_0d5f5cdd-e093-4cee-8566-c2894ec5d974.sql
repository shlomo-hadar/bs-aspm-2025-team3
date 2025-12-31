-- Create function to get trainers with availability (bypasses RLS for counting)
CREATE OR REPLACE FUNCTION get_trainers_with_availability()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  trainee_count INTEGER,
  is_available BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.email,
    COALESCE(get_trainer_trainee_count(p.id), 0)::INTEGER as trainee_count,
    COALESCE(get_trainer_trainee_count(p.id), 0) < 4 as is_available
  FROM profiles p
  WHERE p.role = 'trainer'
  ORDER BY p.name
$$;