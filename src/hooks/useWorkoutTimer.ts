import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export type TimerStatus = "active" | "paused" | "break" | "stopped";

export interface WorkoutTimer {
  id: string;
  trainee_id: string;
  status: TimerStatus;
  started_at: string;
  paused_at: string | null;
  total_paused_seconds: number;
  break_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Get timer for a specific trainee
export function useWorkoutTimer(traineeId: string | undefined) {
  const queryClient = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!traineeId) return;

    const channel = supabase
      .channel(`workout-timer-${traineeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_timers",
          filter: `trainee_id=eq.${traineeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["workout-timer", traineeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [traineeId, queryClient]);

  return useQuery({
    queryKey: ["workout-timer", traineeId],
    queryFn: async () => {
      if (!traineeId) return null;

      const { data, error } = await supabase
        .from("workout_timers")
        .select("*")
        .eq("trainee_id", traineeId)
        .maybeSingle();

      if (error) throw error;
      return data as WorkoutTimer | null;
    },
    enabled: !!traineeId,
  });
}

// Start a new timer
export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (traineeId: string) => {
      // First, delete any existing timer for this trainee
      await supabase.from("workout_timers").delete().eq("trainee_id", traineeId);

      const { data, error } = await supabase
        .from("workout_timers")
        .insert({
          trainee_id: traineeId,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, traineeId) => {
      queryClient.invalidateQueries({ queryKey: ["workout-timer", traineeId] });
    },
  });
}

// Update timer status
export function useUpdateTimerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      traineeId,
      status,
      breakReason,
    }: {
      traineeId: string;
      status: TimerStatus;
      breakReason?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };

      if (status === "paused" || status === "break") {
        updateData.paused_at = new Date().toISOString();
        if (breakReason) {
          updateData.break_reason = breakReason;
        }
      } else if (status === "active") {
        // Calculate total paused time and add to total_paused_seconds
        const { data: currentTimer } = await supabase
          .from("workout_timers")
          .select("paused_at, total_paused_seconds")
          .eq("trainee_id", traineeId)
          .single();

        if (currentTimer?.paused_at) {
          const pausedAt = new Date(currentTimer.paused_at).getTime();
          const now = Date.now();
          const additionalPausedSeconds = Math.floor((now - pausedAt) / 1000);
          updateData.total_paused_seconds =
            (currentTimer.total_paused_seconds || 0) + additionalPausedSeconds;
        }

        updateData.paused_at = null;
        updateData.break_reason = null;
      }

      const { data, error } = await supabase
        .from("workout_timers")
        .update(updateData)
        .eq("trainee_id", traineeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { traineeId }) => {
      queryClient.invalidateQueries({ queryKey: ["workout-timer", traineeId] });
    },
  });
}

// Stop and delete timer
export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (traineeId: string) => {
      const { error } = await supabase
        .from("workout_timers")
        .delete()
        .eq("trainee_id", traineeId);

      if (error) throw error;
    },
    onSuccess: (_, traineeId) => {
      queryClient.invalidateQueries({ queryKey: ["workout-timer", traineeId] });
    },
  });
}
