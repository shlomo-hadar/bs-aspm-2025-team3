import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  name: string;
  role: "trainer" | "trainee";
  email: string;
  created_at: string;
}

export function useTrainees() {
  const { isTrainer, user } = useAuth();

  return useQuery({
    queryKey: ["trainees", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get only trainees assigned to this trainer
      const { data: assignments, error: assignmentsError } = await supabase
        .from("trainer_trainee_assignments")
        .select(`
          trainee:profiles!trainer_trainee_assignments_trainee_id_fkey(id, name, email, role, created_at)
        `)
        .eq("trainer_id", user.id);

      if (assignmentsError) throw assignmentsError;

      // Extract trainee profiles from assignments
      const trainees = (assignments || [])
        .map((a: any) => a.trainee)
        .filter(Boolean) as Profile[];

      return trainees.sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: isTrainer && !!user?.id,
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!userId,
  });
}
