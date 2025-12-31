-- Create security definer function to check if user is trainer (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_trainer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'trainer'
  )
$$;

-- Fix profiles table policies
DROP POLICY IF EXISTS "Trainers can view all profiles" ON public.profiles;
CREATE POLICY "Trainers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_trainer(auth.uid()));

-- Fix exercises table policies
DROP POLICY IF EXISTS "Trainers can insert exercises" ON public.exercises;
DROP POLICY IF EXISTS "Trainers can update exercises" ON public.exercises;

CREATE POLICY "Trainers can insert exercises" ON public.exercises
  FOR INSERT TO authenticated
  WITH CHECK (public.is_trainer(auth.uid()));

CREATE POLICY "Trainers can update exercises" ON public.exercises
  FOR UPDATE TO authenticated
  USING (public.is_trainer(auth.uid()));

-- Fix workout_plans table policies
DROP POLICY IF EXISTS "Trainers can view all workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Trainers can insert workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Trainers can update workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Trainers can delete workout plans" ON public.workout_plans;

CREATE POLICY "Trainers can view all workout plans" ON public.workout_plans
  FOR SELECT USING (public.is_trainer(auth.uid()));

CREATE POLICY "Trainers can insert workout plans" ON public.workout_plans
  FOR INSERT TO authenticated
  WITH CHECK (public.is_trainer(auth.uid()));

CREATE POLICY "Trainers can update workout plans" ON public.workout_plans
  FOR UPDATE TO authenticated
  USING (public.is_trainer(auth.uid()));

CREATE POLICY "Trainers can delete workout plans" ON public.workout_plans
  FOR DELETE TO authenticated
  USING (public.is_trainer(auth.uid()));

-- Fix session_logs table policies
DROP POLICY IF EXISTS "Trainers can view all session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Trainers can insert session logs" ON public.session_logs;

CREATE POLICY "Trainers can view all session logs" ON public.session_logs
  FOR SELECT USING (public.is_trainer(auth.uid()));

CREATE POLICY "Trainers can insert session logs" ON public.session_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_trainer(auth.uid()));