-- Create workout_timers table for tracking workout session timing
CREATE TABLE public.workout_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'break', 'stopped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at TIMESTAMPTZ,
  total_paused_seconds INTEGER DEFAULT 0,
  break_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trainee_id) -- Only one active timer per trainee
);

-- Enable RLS
ALTER TABLE public.workout_timers ENABLE ROW LEVEL SECURITY;

-- Trainees can view their own timer
CREATE POLICY "Trainees can view their own timer"
ON public.workout_timers
FOR SELECT
USING (auth.uid() = trainee_id);

-- Trainees can insert their own timer
CREATE POLICY "Trainees can insert their own timer"
ON public.workout_timers
FOR INSERT
WITH CHECK (auth.uid() = trainee_id);

-- Trainees can update their own timer
CREATE POLICY "Trainees can update their own timer"
ON public.workout_timers
FOR UPDATE
USING (auth.uid() = trainee_id);

-- Trainees can delete their own timer
CREATE POLICY "Trainees can delete their own timer"
ON public.workout_timers
FOR DELETE
USING (auth.uid() = trainee_id);

-- Trainers can view timers of their trainees
CREATE POLICY "Trainers can view trainee timers"
ON public.workout_timers
FOR SELECT
USING (
  is_trainer(auth.uid()) AND 
  EXISTS (
    SELECT 1 FROM public.trainer_trainee_assignments 
    WHERE trainer_id = auth.uid() AND trainee_id = workout_timers.trainee_id
  )
);

-- Trainers can update timers of their trainees
CREATE POLICY "Trainers can update trainee timers"
ON public.workout_timers
FOR UPDATE
USING (
  is_trainer(auth.uid()) AND 
  EXISTS (
    SELECT 1 FROM public.trainer_trainee_assignments 
    WHERE trainer_id = auth.uid() AND trainee_id = workout_timers.trainee_id
  )
);

-- Trainers can insert timers for their trainees
CREATE POLICY "Trainers can insert trainee timers"
ON public.workout_timers
FOR INSERT
WITH CHECK (
  is_trainer(auth.uid()) AND 
  EXISTS (
    SELECT 1 FROM public.trainer_trainee_assignments 
    WHERE trainer_id = auth.uid() AND trainee_id = workout_timers.trainee_id
  )
);

-- Enable realtime for workout_timers
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_timers;

-- Add trigger for updated_at
CREATE TRIGGER update_workout_timers_updated_at
  BEFORE UPDATE ON public.workout_timers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add UPDATE policy for trainer_trainee_assignments (for transferring trainees)
CREATE POLICY "Trainers can update their assignments"
ON public.trainer_trainee_assignments
FOR UPDATE
USING (is_trainer(auth.uid()) AND auth.uid() = trainer_id);