-- Create role enum for type safety
CREATE TYPE user_role AS ENUM ('trainer', 'trainee');

-- Create workout status enum
CREATE TYPE workout_status AS ENUM ('pending', 'done');

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'trainee',
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Trainers can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. EXERCISES TABLE
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_sets INTEGER NOT NULL DEFAULT 3,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view exercises
CREATE POLICY "Authenticated users can view exercises"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (true);

-- Only trainers can insert exercises
CREATE POLICY "Trainers can insert exercises"
  ON public.exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Only trainers can update exercises
CREATE POLICY "Trainers can update exercises"
  ON public.exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- 3. WORKOUT_PLANS TABLE
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  assigned_sets INTEGER NOT NULL DEFAULT 3,
  assigned_reps INTEGER NOT NULL DEFAULT 10,
  assigned_weight INTEGER NOT NULL DEFAULT 0,
  status workout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- Trainees can view their own workout plans
CREATE POLICY "Trainees can view their own workout plans"
  ON public.workout_plans FOR SELECT
  USING (auth.uid() = trainee_id);

-- Trainers can view all workout plans
CREATE POLICY "Trainers can view all workout plans"
  ON public.workout_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Trainers can insert workout plans
CREATE POLICY "Trainers can insert workout plans"
  ON public.workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Trainers can update workout plans
CREATE POLICY "Trainers can update workout plans"
  ON public.workout_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Trainees can update their own workout plans (to mark as done)
CREATE POLICY "Trainees can update their own workout plans"
  ON public.workout_plans FOR UPDATE
  USING (auth.uid() = trainee_id);

-- Trainers can delete workout plans
CREATE POLICY "Trainers can delete workout plans"
  ON public.workout_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- 4. SESSION_LOGS TABLE
CREATE TABLE public.session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  date_completed DATE NOT NULL DEFAULT CURRENT_DATE,
  actual_weight INTEGER NOT NULL DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- Trainees can view their own session logs
CREATE POLICY "Trainees can view their own session logs"
  ON public.session_logs FOR SELECT
  USING (auth.uid() = trainee_id);

-- Trainers can view all session logs
CREATE POLICY "Trainers can view all session logs"
  ON public.session_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Trainees can insert their own session logs
CREATE POLICY "Trainees can insert their own session logs"
  ON public.session_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = trainee_id);

-- Trainers can insert session logs
CREATE POLICY "Trainers can insert session logs"
  ON public.session_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Enable realtime for workout_plans
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_plans;

-- Create trigger for automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'trainee')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- SEED DATA: 10 Exercises
INSERT INTO public.exercises (name, category, default_sets, description) VALUES
  ('Barbell Squat', 'Legs', 4, 'Compound leg exercise targeting quads, glutes, and hamstrings'),
  ('Bench Press', 'Chest', 4, 'Primary chest builder, also works shoulders and triceps'),
  ('Deadlift', 'Back', 3, 'Full body compound movement emphasizing posterior chain'),
  ('Pull-ups', 'Back', 3, 'Bodyweight exercise for lats and biceps'),
  ('Shoulder Press', 'Shoulders', 3, 'Overhead pressing movement for deltoids'),
  ('Barbell Row', 'Back', 4, 'Horizontal pulling for back thickness'),
  ('Leg Press', 'Legs', 4, 'Machine-based leg compound exercise'),
  ('Dumbbell Curl', 'Arms', 3, 'Isolation exercise for biceps'),
  ('Tricep Pushdown', 'Arms', 3, 'Cable exercise for tricep development'),
  ('Lat Pulldown', 'Back', 3, 'Machine-based lat exercise for width');