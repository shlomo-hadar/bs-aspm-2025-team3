import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrainees } from "@/hooks/useProfiles";
import { useSessionLogs } from "@/hooks/useSessionLogs";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useExercises } from "@/hooks/useExercises";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3, User } from "lucide-react";

export default function ReportsPage() {
  const [selectedTrainee, setSelectedTrainee] = useState<string>("");
  const { data: trainees } = useTrainees();
  const { data: sessionLogs } = useSessionLogs(selectedTrainee || undefined);
  const { data: workoutPlans } = useWorkoutPlans();
  const { data: exercises } = useExercises();

  // Progress data for selected trainee
  const progressData = sessionLogs
    ?.sort((a, b) => new Date(a.date_completed).getTime() - new Date(b.date_completed).getTime())
    .slice(-10)
    .map((log) => ({
      date: new Date(log.date_completed).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: log.actual_weight,
      exercise: log.exercises?.name || "Unknown",
    })) || [];

  // Exercise popularity data
  const exerciseCount = workoutPlans?.reduce((acc, plan) => {
    const exerciseName = plan.exercises?.name || "Unknown";
    acc[exerciseName] = (acc[exerciseName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const popularityData = Object.entries(exerciseCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const colors = [
    "hsl(82, 84%, 55%)",
    "hsl(180, 70%, 50%)",
    "hsl(45, 93%, 58%)",
    "hsl(142, 76%, 45%)",
    "hsl(200, 70%, 50%)",
    "hsl(280, 70%, 60%)",
    "hsl(30, 80%, 55%)",
    "hsl(350, 70%, 55%)",
  ];

  return (
    <Layout title="REPORTS" showBack>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Progress Report */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="text-primary" />
                USER PROGRESS REPORT
              </CardTitle>
              <Select value={selectedTrainee} onValueChange={setSelectedTrainee}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select trainee" />
                </SelectTrigger>
                <SelectContent>
                  {trainees?.map((trainee) => (
                    <SelectItem key={trainee.id} value={trainee.id}>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        {trainee.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTrainee ? (
              progressData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 22%)" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(220, 10%, 60%)"
                        tick={{ fill: "hsl(220, 10%, 60%)" }}
                      />
                      <YAxis
                        stroke="hsl(220, 10%, 60%)"
                        tick={{ fill: "hsl(220, 10%, 60%)" }}
                        label={{
                          value: "Weight (kg)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "hsl(220, 10%, 60%)",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(220, 18%, 12%)",
                          border: "1px solid hsl(220, 14%, 22%)",
                          borderRadius: "8px",
                          color: "hsl(0, 0%, 98%)",
                        }}
                        labelStyle={{ color: "hsl(82, 84%, 55%)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(82, 84%, 55%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(82, 84%, 55%)", strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: "hsl(82, 84%, 55%)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No session logs found for this trainee</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a trainee to view their progress</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Popularity Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="text-accent" />
              EXERCISE POPULARITY REPORT
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularityData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 22%)" />
                    <XAxis
                      type="number"
                      stroke="hsl(220, 10%, 60%)"
                      tick={{ fill: "hsl(220, 10%, 60%)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(220, 10%, 60%)"
                      tick={{ fill: "hsl(220, 10%, 60%)", fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 18%, 12%)",
                        border: "1px solid hsl(220, 14%, 22%)",
                        borderRadius: "8px",
                        color: "hsl(0, 0%, 98%)",
                      }}
                      labelStyle={{ color: "hsl(180, 70%, 50%)" }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {popularityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No workout data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
