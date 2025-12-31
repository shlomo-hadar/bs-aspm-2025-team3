import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyTrainees } from "@/hooks/useTrainerAssignments";
import { usePendingWorkouts } from "@/hooks/useWorkoutPlans";
import { useExercises } from "@/hooks/useExercises";
import { Users, Dumbbell, Activity, TrendingUp } from "lucide-react";
import { SeedDatabaseButton } from "@/components/SeedDatabaseButton";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { data: myTrainees, isLoading: traineesLoading } = useMyTrainees();
  const { data: pendingWorkouts, isLoading: workoutsLoading } = usePendingWorkouts();
  const { data: exercises } = useExercises();

  const traineeCount = myTrainees?.length || 0;

  const stats = [
    {
      label: "My Trainees",
      value: `${traineeCount}/4`,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active Workouts",
      value: pendingWorkouts?.length ?? 0,
      icon: Activity,
      color: "text-accent",
    },
    {
      label: "Exercises",
      value: exercises?.length ?? 0,
      icon: Dumbbell,
      color: "text-warning",
    },
    {
      label: "Completed Today",
      value: "0",
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  return (
    <Layout title="TRAINER DASHBOARD">
      {/* Seed Database Button */}
      <div className="flex justify-end mb-6">
        <SeedDatabaseButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} variant="elevated" className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-3xl font-display">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card variant="interactive" onClick={() => navigate("/trainees")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="text-primary" />
              MANAGE TRAINEES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View all trainees and assign workout plans
            </p>
            <Button variant="outline" className="w-full">
              View Trainees
            </Button>
          </CardContent>
        </Card>

        <Card variant="interactive" onClick={() => navigate("/live")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="text-accent" />
              LIVE SPLIT VIEW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor active workouts in real-time on gym screens
            </p>
            <Button variant="outline" className="w-full">
              Open Live View
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>ACTIVE WORKOUTS</CardTitle>
        </CardHeader>
        <CardContent>
          {workoutsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingWorkouts && pendingWorkouts.length > 0 ? (
            <div className="space-y-3">
              {pendingWorkouts.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                >
                  <div>
                    <p className="font-medium">{workout.profiles?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workout.exercises?.name} - {workout.assigned_sets}x
                      {workout.assigned_reps} @ {workout.assigned_weight}kg
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active workouts</p>
              <p className="text-sm">Assign workouts to trainees to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
