import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePendingWorkouts, useUpdateWorkoutStatus, WorkoutPlan } from "@/hooks/useWorkoutPlans";
import { useCreateSessionLog } from "@/hooks/useSessionLogs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Dumbbell, Maximize, Minimize } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeartRateMonitor } from "@/components/HeartRateMonitor";
import { WorkoutTimer } from "@/components/WorkoutTimer";
export default function LiveViewPage() {
  const navigate = useNavigate();
  const { isTrainer, user } = useAuth();
  const { data: pendingWorkouts, isLoading } = usePendingWorkouts();
  const updateStatus = useUpdateWorkoutStatus();
  const createSessionLog = useCreateSessionLog();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Group workouts by trainee
  const workoutsByTrainee = pendingWorkouts?.reduce((acc, workout) => {
    const traineeId = workout.trainee_id;
    if (!acc[traineeId]) {
      acc[traineeId] = {
        trainee: workout.profiles,
        workouts: [],
      };
    }
    acc[traineeId].workouts.push(workout);
    return acc;
  }, {} as Record<string, { trainee: WorkoutPlan["profiles"]; workouts: WorkoutPlan[] }>) || {};

  const activeTrainees = Object.values(workoutsByTrainee);

  // Determine grid layout based on number of trainees
  const getGridClass = () => {
    const count = activeTrainees.length;
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-2";
  };

  const handleMarkDone = async (workout: WorkoutPlan) => {
    try {
      await updateStatus.mutateAsync({ id: workout.id, status: "done" });
      
      // Create session log
      await createSessionLog.mutateAsync({
        trainee_id: workout.trainee_id,
        exercise_id: workout.exercise_id,
        actual_weight: workout.assigned_weight,
        rating: 5,
      });

      toast.success(`${workout.exercises?.name} completed!`);
    } catch (error) {
      toast.error("Failed to update workout");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl tracking-wider">LIVE WORKOUTS</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
            {activeTrainees.length} Active
          </span>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </Button>
        </div>
      </header>

      {/* Live Grid */}
      <div className={cn("flex-1 grid gap-4 p-4", getGridClass())}>
        {activeTrainees.length > 0 ? (
          activeTrainees.map(({ trainee, workouts }) => (
            <div
              key={trainee?.id}
              className="relative rounded-2xl border-2 border-primary/50 bg-card overflow-hidden animate-fade-in"
            >
              {/* Trainee Header */}
              <div className="bg-primary/10 border-b border-primary/30 p-6 flex items-center justify-between">
                <h2 className="tv-text-large text-primary text-glow">
                  {trainee?.name?.toUpperCase()}
                </h2>
                <div className="flex items-center gap-4">
                  {/* Workout Timer */}
                  <WorkoutTimer traineeId={trainee?.id || ""} compact />
                  {/* Heart Rate Monitor - IoT Sensor Simulation */}
                  <HeartRateMonitor compact />
                </div>
              </div>

              {/* Full Timer Display */}
              <div className="p-4 border-b border-border">
                <WorkoutTimer traineeId={trainee?.id || ""} />
              </div>

              {/* Current Workout */}
              <div className="p-6 space-y-6">
                {workouts.slice(0, 1).map((workout) => (
                  <div key={workout.id} className="space-y-6">
                    <div className="text-center">
                      <h3 className="tv-text text-foreground mb-2">
                        {workout.exercises?.name?.toUpperCase()}
                      </h3>
                      <p className="text-xl text-muted-foreground">
                        {workout.exercises?.category}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-xl bg-secondary">
                        <p className="tv-text text-primary">{workout.assigned_sets}</p>
                        <p className="text-sm uppercase text-muted-foreground">Sets</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary">
                        <p className="tv-text text-primary">{workout.assigned_reps}</p>
                        <p className="text-sm uppercase text-muted-foreground">Reps</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary">
                        <p className="tv-text text-primary">{workout.assigned_weight}</p>
                        <p className="text-sm uppercase text-muted-foreground">KG</p>
                      </div>
                    </div>

                    {/* Done Button */}
                    <Button
                      variant="tv"
                      className="w-full"
                      onClick={() => handleMarkDone(workout)}
                      disabled={updateStatus.isPending}
                    >
                      <Check size={28} className="mr-3" />
                      {updateStatus.isPending ? "COMPLETING..." : "DONE"}
                    </Button>

                    {/* Remaining exercises */}
                    {workouts.length > 1 && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">
                          UP NEXT ({workouts.length - 1} more)
                        </p>
                        <div className="space-y-2">
                          {workouts.slice(1, 4).map((w) => (
                            <div
                              key={w.id}
                              className="px-4 py-3 rounded-lg bg-secondary/50 text-sm"
                            >
                              {w.exercises?.name} - {w.assigned_sets}×{w.assigned_reps}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center min-h-[60vh]">
            <Dumbbell className="w-24 h-24 text-muted-foreground/30 mb-6" />
            <h2 className="font-display text-4xl text-muted-foreground mb-2">
              NO ACTIVE WORKOUTS
            </h2>
            <p className="text-muted-foreground">
              {isTrainer
                ? "Assign workouts to trainees to see them here"
                : "Wait for your trainer to assign workouts"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
