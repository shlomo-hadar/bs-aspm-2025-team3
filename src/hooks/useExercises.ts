import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  default_sets: number;
  description: string | null;
  created_at: string;
}

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exercise: Omit<Exercise, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("exercises")
        .insert(exercise)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}
