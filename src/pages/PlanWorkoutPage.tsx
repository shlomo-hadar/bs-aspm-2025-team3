import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfiles";
import { useExercises, useCreateExercise } from "@/hooks/useExercises";
import { useWorkoutPlans, useCreateWorkoutPlan, useDeleteWorkoutPlan } from "@/hooks/useWorkoutPlans";
import { toast } from "sonner";
import { Plus, Dumbbell, Trash2, Check } from "lucide-react";

export default function PlanWorkoutPage() {
  const { traineeId } = useParams();
  const navigate = useNavigate();
  const { data: trainee } = useProfile(traineeId);
  const { data: exercises } = useExercises();
  const { data: workoutPlans, isLoading: plansLoading } = useWorkoutPlans(traineeId);
  const createWorkoutPlan = useCreateWorkoutPlan();
  const deleteWorkoutPlan = useDeleteWorkoutPlan();
  const createExercise = useCreateExercise();

  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");

  // Quick add exercise state
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const handleAddWorkout = async () => {
    if (!selectedExercise || !traineeId) {
      toast.error("Please select an exercise");
      return;
    }

    try {
      await createWorkoutPlan.mutateAsync({
        trainee_id: traineeId,
        exercise_id: selectedExercise,
        assigned_sets: parseInt(sets),
        assigned_reps: parseInt(reps),
        assigned_weight: parseInt(weight),
      });
      toast.success("Workout assigned successfully!");
      setSelectedExercise("");
      setSets("3");
      setReps("10");
      setWeight("0");
    } catch (error) {
      toast.error("Failed to assign workout");
    }
  };

  const handleQuickAdd = async () => {
    if (!newExerciseName || !newExerciseCategory) {
      toast.error("Please fill in exercise name and category");
      return;
    }

    try {
      await createExercise.mutateAsync({
        name: newExerciseName,
        category: newExerciseCategory,
        default_sets: 3,
        description: newExerciseDescription || null,
      });
      toast.success("Exercise added to catalog!");
      setNewExerciseName("");
      setNewExerciseCategory("");
      setNewExerciseDescription("");
      setQuickAddOpen(false);
    } catch (error) {
      toast.error("Failed to create exercise");
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteWorkoutPlan.mutateAsync(id);
      toast.success("Workout removed");
    } catch (error) {
      toast.error("Failed to remove workout");
    }
  };

  const pendingPlans = workoutPlans?.filter((p) => p.status === "pending") || [];
  const completedPlans = workoutPlans?.filter((p) => p.status === "done") || [];

  return (
    <Layout title={`PLAN WORKOUT`} showBack>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Trainee Info */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-3xl tracking-wide">
                  {trainee?.name?.toUpperCase() || "LOADING..."}
                </h2>
                <p className="text-muted-foreground">{trainee?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Workout Form */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ASSIGN EXERCISE</CardTitle>
            <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Quick Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">ADD NEW EXERCISE</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Exercise Name</Label>
                    <Input
                      placeholder="e.g., Romanian Deadlift"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      placeholder="e.g., Legs, Back, Chest"
                      value={newExerciseCategory}
                      onChange={(e) => setNewExerciseCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="Brief description..."
                      value={newExerciseDescription}
                      onChange={(e) => setNewExerciseDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleQuickAdd}
                    className="w-full"
                    disabled={createExercise.isPending}
                  >
                    {createExercise.isPending ? "Adding..." : "Add to Catalog"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2 space-y-2">
                <Label>Exercise</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises?.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} ({exercise.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <Button
                  onClick={handleAddWorkout}
                  className="w-full"
                  size="lg"
                  disabled={createWorkoutPlan.isPending}
                >
                  <Plus size={18} className="mr-2" />
                  {createWorkoutPlan.isPending ? "Assigning..." : "Assign Workout"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>PENDING WORKOUTS ({pendingPlans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {plansLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pendingPlans.length > 0 ? (
              <div className="space-y-3">
                {pendingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                  >
                    <div>
                      <p className="font-medium">{plan.exercises?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.assigned_sets} sets × {plan.assigned_reps} reps @{" "}
                        {plan.assigned_weight}kg
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 size={18} className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending workouts assigned
              </p>
            )}
          </CardContent>
        </Card>

        {/* Completed Workouts */}
        {completedPlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>COMPLETED ({completedPlans.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Check className="text-success" size={20} />
                      <div>
                        <p className="font-medium">{plan.exercises?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.assigned_sets} sets × {plan.assigned_reps} reps @{" "}
                          {plan.assigned_weight}kg
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
