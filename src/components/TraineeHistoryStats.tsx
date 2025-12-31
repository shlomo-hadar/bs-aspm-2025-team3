import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionLog } from "@/hooks/useSessionLogs";
import { 
  TrendingUp, 
  Dumbbell, 
  Star, 
  Calendar, 
  Activity,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface TraineeHistoryStatsProps {
  sessionLogs: SessionLog[];
  traineeName?: string;
}

interface ExerciseStats {
  name: string;
  category: string;
  totalSessions: number;
  avgWeight: number;
  maxWeight: number;
  avgRating: number;
  lastPerformed: string;
}

export function TraineeHistoryStats({ sessionLogs, traineeName }: TraineeHistoryStatsProps) {
  const stats = useMemo(() => {
    if (!sessionLogs || sessionLogs.length === 0) {
      return null;
    }

    // Overall statistics
    const totalWorkouts = sessionLogs.length;
    const totalWeight = sessionLogs.reduce((sum, log) => sum + log.actual_weight, 0);
    const avgWeight = totalWeight / totalWorkouts;
    const maxWeight = Math.max(...sessionLogs.map(log => log.actual_weight));
    
    const ratings = sessionLogs.filter(log => log.rating !== null).map(log => log.rating!);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0;

    // Group by exercise
    const exerciseMap = new Map<string, {
      logs: SessionLog[];
      name: string;
      category: string;
    }>();

    sessionLogs.forEach(log => {
      const exerciseId = log.exercise_id;
      if (!exerciseMap.has(exerciseId)) {
        exerciseMap.set(exerciseId, {
          logs: [],
          name: log.exercises?.name || "Unknown",
          category: log.exercises?.category || "Unknown",
        });
      }
      exerciseMap.get(exerciseId)!.logs.push(log);
    });

    const exerciseStats: ExerciseStats[] = Array.from(exerciseMap.entries()).map(([_, data]) => {
      const logs = data.logs;
      const weights = logs.map(l => l.actual_weight);
      const logRatings = logs.filter(l => l.rating !== null).map(l => l.rating!);
      
      return {
        name: data.name,
        category: data.category,
        totalSessions: logs.length,
        avgWeight: weights.reduce((a, b) => a + b, 0) / weights.length,
        maxWeight: Math.max(...weights),
        avgRating: logRatings.length > 0 
          ? logRatings.reduce((a, b) => a + b, 0) / logRatings.length 
          : 0,
        lastPerformed: logs.sort((a, b) => 
          new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime()
        )[0].date_completed,
      };
    });

    // Sort by total sessions
    exerciseStats.sort((a, b) => b.totalSessions - a.totalSessions);

    // Unique workout days
    const uniqueDays = new Set(sessionLogs.map(log => log.date_completed));
    const workoutDays = uniqueDays.size;

    // Most recent workout
    const sortedByDate = [...sessionLogs].sort((a, b) => 
      new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime()
    );
    const lastWorkout = sortedByDate[0]?.date_completed;

    return {
      totalWorkouts,
      avgWeight: Math.round(avgWeight * 10) / 10,
      maxWeight,
      avgRating: Math.round(avgRating * 10) / 10,
      workoutDays,
      lastWorkout,
      exerciseStats: exerciseStats.slice(0, 5), // Top 5 exercises
      topExercise: exerciseStats[0],
    };
  }, [sessionLogs]);

  if (!stats) {
    return (
      <Card className="mb-6">
        <CardContent className="py-12 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-display text-2xl text-muted-foreground mb-2">
            NO WORKOUT HISTORY
          </h3>
          <p className="text-muted-foreground">
            {traineeName ? `${traineeName} hasn't completed any workouts yet` : "No workout data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold font-mono">{stats.totalWorkouts}</p>
            <p className="text-sm text-muted-foreground">Total Exercises</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold font-mono">{stats.avgWeight}<span className="text-lg">kg</span></p>
            <p className="text-sm text-muted-foreground">Avg Weight</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold font-mono">{stats.maxWeight}<span className="text-lg">kg</span></p>
            <p className="text-sm text-muted-foreground">Max Weight</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-3xl font-bold font-mono">{stats.avgRating || "-"}</p>
            <p className="text-sm text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="text-primary" />
            ACTIVITY SUMMARY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Workout Days</span>
            <span className="font-mono font-bold">{stats.workoutDays} days</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Last Workout</span>
            <span className="font-mono font-bold">
              {stats.lastWorkout 
                ? format(new Date(stats.lastWorkout), "dd MMM yyyy", { locale: he })
                : "-"
              }
            </span>
          </div>
          {stats.topExercise && (
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Favorite Exercise</span>
              <span className="font-mono font-bold">{stats.topExercise.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Activity className="text-primary" />
            EXERCISE BREAKDOWN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.exerciseStats.map((exercise, index) => (
              <div 
                key={exercise.name}
                className="p-4 rounded-xl bg-secondary border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display text-lg">{exercise.name.toUpperCase()}</h4>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                    {exercise.category}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="font-mono font-bold">{exercise.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold">{Math.round(exercise.avgWeight)}kg</p>
                    <p className="text-xs text-muted-foreground">Avg</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold">{exercise.maxWeight}kg</p>
                    <p className="text-xs text-muted-foreground">Max</p>
                  </div>
                  <div>
                    <p className="font-mono font-bold">{exercise.avgRating || "-"}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
