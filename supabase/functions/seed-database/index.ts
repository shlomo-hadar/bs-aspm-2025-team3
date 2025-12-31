import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Seed exercises
    const exercises = [
      { name: "Barbell Squat", category: "Legs", default_sets: 4, description: "Compound leg exercise targeting quads, hamstrings, and glutes" },
      { name: "Bench Press", category: "Chest", default_sets: 4, description: "Primary chest exercise also engaging triceps and shoulders" },
      { name: "Deadlift", category: "Back", default_sets: 3, description: "Full body compound lift focusing on posterior chain" },
      { name: "Overhead Press", category: "Shoulders", default_sets: 3, description: "Shoulder press for deltoid development" },
      { name: "Barbell Row", category: "Back", default_sets: 4, description: "Horizontal pulling movement for back thickness" },
      { name: "Pull-ups", category: "Back", default_sets: 3, description: "Bodyweight vertical pulling exercise" },
      { name: "Leg Press", category: "Legs", default_sets: 4, description: "Machine-based leg pressing movement" },
      { name: "Dumbbell Curls", category: "Arms", default_sets: 3, description: "Isolation exercise for biceps" },
      { name: "Tricep Dips", category: "Arms", default_sets: 3, description: "Compound pushing exercise for triceps" },
      { name: "Plank", category: "Core", default_sets: 3, description: "Isometric core stability exercise" },
    ];

    // Clear existing exercises and insert new ones
    await supabase.from("exercises").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    const { data: insertedExercises, error: exercisesError } = await supabase
      .from("exercises")
      .insert(exercises)
      .select();

    if (exercisesError) {
      throw new Error(`Failed to insert exercises: ${exercisesError.message}`);
    }

    console.log("Inserted exercises:", insertedExercises?.length);

    // Get existing trainees
    const { data: trainees, error: traineesError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "trainee");

    if (traineesError) {
      console.log("No trainees found or error:", traineesError.message);
    }

    // Create sample workout plans if we have trainees and exercises
    if (trainees && trainees.length > 0 && insertedExercises && insertedExercises.length > 0) {
      // Clear existing workout plans
      await supabase.from("workout_plans").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      const workoutPlans = [];
      
      // Assign first 2 exercises to each trainee
      for (let i = 0; i < Math.min(trainees.length, 4); i++) {
        const trainee = trainees[i];
        // Assign 2 exercises per trainee
        for (let j = 0; j < 2; j++) {
          const exerciseIndex = (i * 2 + j) % insertedExercises.length;
          workoutPlans.push({
            trainee_id: trainee.id,
            exercise_id: insertedExercises[exerciseIndex].id,
            assigned_sets: 3 + Math.floor(Math.random() * 2),
            assigned_reps: 8 + Math.floor(Math.random() * 5),
            assigned_weight: 20 + Math.floor(Math.random() * 80),
            status: "pending",
          });
        }
      }

      if (workoutPlans.length > 0) {
        const { error: plansError } = await supabase
          .from("workout_plans")
          .insert(workoutPlans);

        if (plansError) {
          console.log("Failed to insert workout plans:", plansError.message);
        } else {
          console.log("Inserted workout plans:", workoutPlans.length);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Database seeded successfully",
        exercises: insertedExercises?.length || 0,
        note: "Create trainer and trainee accounts through the auth page to test full functionality",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Seed error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
