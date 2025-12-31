import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface TrainerWithAvailability {
  id: string;
  name: string;
  email: string;
  trainee_count: number;
  is_available: boolean;
}

export interface TrainerAssignment {
  id: string;
  trainer_id: string;
  trainee_id: string;
  assigned_at: string;
}

const MAX_TRAINEES_PER_TRAINER = 4;

// Fetch all trainers with their availability using RPC function
export function useTrainersWithAvailability() {
  return useQuery({
    queryKey: ["trainers-availability"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_trainers_with_availability");

      if (error) throw error;
      return (data || []) as TrainerWithAvailability[];
    },
  });
}

// Get current trainee's assignment
export function useMyTrainerAssignment() {
  const { user, isTrainee } = useAuth();

  return useQuery({
    queryKey: ["my-trainer-assignment", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("trainer_trainee_assignments")
        .select(`
          *,
          trainer:profiles!trainer_trainee_assignments_trainer_id_fkey(id, name, email)
        `)
        .eq("trainee_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isTrainee,
  });
}

// Assign trainee to trainer
export function useAssignToTrainer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("trainer_trainee_assignments")
        .insert({
          trainer_id: trainerId,
          trainee_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers-availability"] });
      queryClient.invalidateQueries({ queryKey: ["my-trainer-assignment"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
    },
  });
}

// Get trainer's assigned trainees (for trainers)
export function useMyTrainees() {
  const { user, isTrainer } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    if (!isTrainer || !user?.id) return;

    const channel = supabase
      .channel("trainer-assignments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trainer_trainee_assignments",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["my-trainees"] });
          queryClient.invalidateQueries({ queryKey: ["trainees"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isTrainer, user?.id, queryClient]);

  return useQuery({
    queryKey: ["my-trainees", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("trainer_trainee_assignments")
        .select(`
          *,
          trainee:profiles!trainer_trainee_assignments_trainee_id_fkey(id, name, email, role, created_at)
        `)
        .eq("trainer_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && isTrainer,
  });
}

// Remove trainee from trainer
export function useRemoveTrainee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("trainer_trainee_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainers-availability"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
    },
  });
}

// Transfer trainee to another trainer
export function useTransferTrainee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      traineeId,
      toTrainerId,
    }: {
      traineeId: string;
      toTrainerId: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("trainer_trainee_assignments")
        .update({ trainer_id: toTrainerId })
        .eq("trainee_id", traineeId)
        .eq("trainer_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainers-availability"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
    },
  });
}
