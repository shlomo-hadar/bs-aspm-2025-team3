import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowRight, Users, Activity, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useMyTrainerAssignment } from "@/hooks/useTrainerAssignments";

export default function Index() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { data: assignment, isLoading: assignmentLoading } = useMyTrainerAssignment();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "trainer") {
        navigate("/dashboard", { replace: true });
      } else {
        // Wait for assignment check before redirecting trainees
        if (!assignmentLoading) {
          if (assignment) {
            navigate("/my-workouts", { replace: true });
          } else {
            navigate("/select-trainer", { replace: true });
          }
        }
      }
    }
  }, [user, profile, loading, navigate, assignment, assignmentLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Manage Trainees",
      description: "Easily track and manage all your trainees in one place",
    },
    {
      icon: Activity,
      title: "Live Split-Screen",
      description: "Display workouts on gym TVs with real-time updates",
    },
    {
      icon: BarChart3,
      title: "Progress Reports",
      description: "Visualize trainee progress with detailed charts",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-8 glow-primary animate-pulse-glow">
            <Dumbbell className="w-12 h-12 text-primary-foreground" />
          </div>

          <h1 className="font-display text-6xl md:text-8xl tracking-wider mb-4 text-glow">
            FITSPLIT
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            The ultimate gym training management platform for trainers and trainees
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="xl" onClick={() => navigate("/auth")}>
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="xl" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl mb-2">{feature.title.toUpperCase()}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border">
        <p>© 2024 FitSplit — Gym Training Management</p>
      </footer>
    </div>
  );
}
