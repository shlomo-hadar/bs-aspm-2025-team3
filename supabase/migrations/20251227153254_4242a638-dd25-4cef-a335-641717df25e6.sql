-- Allow authenticated users to view trainer profiles
CREATE POLICY "Trainees can view trainers"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'trainer');