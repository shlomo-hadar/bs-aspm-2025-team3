-- Create trainer_trainee_assignments table
CREATE TABLE public.trainer_trainee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trainee_id) -- Each trainee can only have one trainer
);

-- Enable RLS
ALTER TABLE public.trainer_trainee_assignments ENABLE ROW LEVEL SECURITY;

-- Create function to check trainer capacity (max 4 trainees)
CREATE OR REPLACE FUNCTION public.check_trainer_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.trainer_trainee_assignments 
      WHERE trainer_id = NEW.trainer_id) >= 4 THEN
    RAISE EXCEPTION 'Trainer already has maximum 4 trainees';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to enforce trainer capacity
CREATE TRIGGER enforce_trainer_capacity
BEFORE INSERT ON public.trainer_trainee_assignments
FOR EACH ROW EXECUTE FUNCTION public.check_trainer_capacity();

-- Create function to check if user is a trainee
CREATE OR REPLACE FUNCTION public.is_trainee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'trainee'
  )
$$;

-- Create function to get trainer's trainee count
CREATE OR REPLACE FUNCTION public.get_trainer_trainee_count(_trainer_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.trainer_trainee_assignments
  WHERE trainer_id = _trainer_id
$$;

-- RLS Policies for trainer_trainee_assignments

-- Trainees can view their own assignment
CREATE POLICY "Trainees can view their own assignment"
ON public.trainer_trainee_assignments
FOR SELECT
USING (auth.uid() = trainee_id);

-- Trainers can view their assigned trainees
CREATE POLICY "Trainers can view their assigned trainees"
ON public.trainer_trainee_assignments
FOR SELECT
USING (auth.uid() = trainer_id);

-- Trainees can insert their own assignment (choose a trainer)
CREATE POLICY "Trainees can choose a trainer"
ON public.trainer_trainee_assignments
FOR INSERT
WITH CHECK (auth.uid() = trainee_id AND is_trainee(auth.uid()));

-- Trainers can delete assignments (remove trainees)
CREATE POLICY "Trainers can remove trainees"
ON public.trainer_trainee_assignments
FOR DELETE
USING (is_trainer(auth.uid()) AND auth.uid() = trainer_id);

-- Enable realtime for assignments
ALTER PUBLICATION supabase_realtime ADD TABLE public.trainer_trainee_assignments;