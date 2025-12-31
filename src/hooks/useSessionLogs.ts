import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SessionLog {
  id: string;
  trainee_id: string;
  exercise_id: string;
  date_completed: string;
  actual_weight: number;
  rating: number | null;
  created_at: string;
  exercises?: {
    id: string;
    name: string;
    category: string;
  };
  profiles?: {
    id: string;
    name: string;
  };
}

export function useSessionLogs(traineeId?: string) {
  const { user, isTrainer } = useAuth();

  return useQuery({
    queryKey: ["session_logs", traineeId],
    queryFn: async () => {
      let q = supabase
        .from("session_logs")
        .select(`
          *,
          exercises (id, name, category),
          profiles (id, name)
        `)
        .order("date_completed", { ascending: false });

      if (traineeId) {
        q = q.eq("trainee_id", traineeId);
      } else if (!isTrainer && user) {
        q = q.eq("trainee_id", user.id);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as SessionLog[];
    },
    enabled: !!user,
  });
}

export function useCreateSessionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: {
      trainee_id: string;
      exercise_id: string;
      actual_weight: number;
      rating?: number;
    }) => {
      const { data, error } = await supabase
        .from("session_logs")
        .insert({
          ...log,
          date_completed: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_logs"] });
    },
  });
}
