import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkoutPlans, useUpdateWorkoutStatus } from "@/hooks/useWorkoutPlans";
import { useCreateSessionLog } from "@/hooks/useSessionLogs";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrainerAssignment } from "@/hooks/useTrainerAssignments";
import { toast } from "sonner";
import { Check, Dumbbell, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HeartRateMonitor } from "@/components/HeartRateMonitor";

export default function TraineeWorkoutsPage() {
  const navigate = useNavigate();
  const { user, isTrainee } = useAuth();
  const { data: myAssignment, isLoading: loadingAssignment } = useMyTrainerAssignment();
  const { data: workouts, isLoading } = useWorkoutPlans(user?.id);
  const updateStatus = useUpdateWorkoutStatus();
  const createSessionLog = useCreateSessionLog();

  // Redirect trainee to select trainer if no assignment
  useEffect(() => {
    if (isTrainee && !loadingAssignment && !myAssignment) {
      navigate("/select-trainer");
    }
  }, [isTrainee, loadingAssignment, myAssignment, navigate]);

  const pendingWorkouts = workouts?.filter((w) => w.status === "pending") || [];
  const completedWorkouts = workouts?.filter((w) => w.status === "done") || [];

  const handleComplete = async (workout: typeof workouts extends (infer T)[] ? T : never) => {
    try {
      await updateStatus.mutateAsync({ id: workout.id, status: "done" });
      await createSessionLog.mutateAsync({
        trainee_id: workout.trainee_id,
        exercise_id: workout.exercise_id,
        actual_weight: workout.assigned_weight,
        rating: 5,
      });
      toast.success(`${workout.exercises?.name} completed!`);
    } catch (error) {
      toast.error("Failed to complete workout");
    }
  };

  return (
    <Layout title="MY WORKOUTS">
      {/* Heart Rate Monitor - IoT Sensor Simulation */}
      <HeartRateMonitor className="mb-6" />

      {/* Quick action */}
      <Card
        variant="interactive"
        className="mb-6"
        onClick={() => navigate("/live")}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl">LIVE VIEW</h3>
              <p className="text-sm text-muted-foreground">
                Open fullscreen workout display
              </p>
            </div>
          </div>
          <Button>Open</Button>
        </CardContent>
      </Card>

      {/* Pending Workouts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Dumbbell className="text-primary" />
            PENDING WORKOUTS ({pendingWorkouts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingWorkouts.length > 0 ? (
            <div className="space-y-4">
              {pendingWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-5 rounded-xl bg-secondary border border-border"
                >
                  <div>
                    <h4 className="font-display text-xl">
                      {workout.exercises?.name?.toUpperCase()}
                    </h4>
                    <p className="text-muted-foreground">
                      {workout.assigned_sets} sets × {workout.assigned_reps} reps
                      @ {workout.assigned_weight}kg
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      {workout.exercises?.category}
                    </span>
                  </div>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleComplete(workout)}
                    disabled={updateStatus.isPending}
                  >
                    <Check size={20} className="mr-2" />
                    Done
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-display text-2xl text-muted-foreground mb-2">
                NO PENDING WORKOUTS
              </h3>
              <p className="text-muted-foreground">
                Your trainer will assign workouts for you
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Today */}
      {completedWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Check className="text-success" />
              COMPLETED ({completedWorkouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 opacity-70"
                >
                  <Check className="text-success shrink-0" size={20} />
                  <div>
                    <p className="font-medium">{workout.exercises?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workout.assigned_sets}×{workout.assigned_reps} @{" "}
                      {workout.assigned_weight}kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
