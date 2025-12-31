import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useMyTrainees } from "./useTrainerAssignments";

export interface WorkoutPlan {
  id: string;
  trainee_id: string;
  exercise_id: string;
  assigned_sets: number;
  assigned_reps: number;
  assigned_weight: number;
  status: "pending" | "done";
  created_at: string;
  updated_at: string;
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

export function useWorkoutPlans(traineeId?: string) {
  const { user, isTrainer } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["workout_plans", traineeId],
    queryFn: async () => {
      let q = supabase
        .from("workout_plans")
        .select(`
          *,
          exercises (id, name, category),
          profiles (id, name)
        `)
        .order("created_at", { ascending: false });

      if (traineeId) {
        q = q.eq("trainee_id", traineeId);
      } else if (!isTrainer && user) {
        q = q.eq("trainee_id", user.id);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as WorkoutPlan[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("workout_plans_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_plans",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["workout_plans"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function usePendingWorkouts() {
  const { user, isTrainer } = useAuth();
  const queryClient = useQueryClient();
  const { data: myTrainees } = useMyTrainees();

  const query = useQuery({
    queryKey: ["pending_workouts", user?.id, myTrainees?.map(t => t.trainee_id)],
    queryFn: async () => {
      let q = supabase
        .from("workout_plans")
        .select(`
          *,
          exercises (id, name, category),
          profiles (id, name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      // If trainer - filter only to their assigned trainees
      if (isTrainer && myTrainees) {
        if (myTrainees.length === 0) {
          // Trainer has no trainees, return empty
          return [] as WorkoutPlan[];
        }
        const traineeIds = myTrainees.map(t => t.trainee_id);
        q = q.in("trainee_id", traineeIds);
      } else if (!isTrainer && user) {
        // If trainee - only their own
        q = q.eq("trainee_id", user.id);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as WorkoutPlan[];
    },
    enabled: !!user && (!isTrainer || myTrainees !== undefined),
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("pending_workouts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_plans",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending_workouts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: {
      trainee_id: string;
      exercise_id: string;
      assigned_sets: number;
      assigned_reps: number;
      assigned_weight: number;
    }) => {
      const { data, error } = await supabase
        .from("workout_plans")
        .insert({
          ...plan,
          status: "pending" as const,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_plans"] });
      queryClient.invalidateQueries({ queryKey: ["pending_workouts"] });
    },
  });
}

export function useUpdateWorkoutStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "done" }) => {
      const { data, error } = await supabase
        .from("workout_plans")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_plans"] });
      queryClient.invalidateQueries({ queryKey: ["pending_workouts"] });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workout_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_plans"] });
      queryClient.invalidateQueries({ queryKey: ["pending_workouts"] });
    },
  });
}
