import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrainersWithAvailability, useAssignToTrainer, useMyTrainerAssignment } from "@/hooks/useTrainerAssignments";
import { User, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SelectTrainerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isTrainee } = useAuth();
  const { data: trainers, isLoading: loadingTrainers } = useTrainersWithAvailability();
  const { data: myAssignment, isLoading: loadingAssignment } = useMyTrainerAssignment();
  const assignToTrainer = useAssignToTrainer();

  // Redirect if already has a trainer
  useEffect(() => {
    if (!loadingAssignment && myAssignment) {
      navigate("/my-workouts");
    }
  }, [myAssignment, loadingAssignment, navigate]);

  const handleSelectTrainer = async (trainerId: string) => {
    try {
      await assignToTrainer.mutateAsync(trainerId);
      toast({
        title: "מאמן נבחר בהצלחה!",
        description: "כעת תוכל לצפות בתוכניות האימון שלך",
      });
      navigate("/my-workouts");
    } catch (error: any) {
      toast({
        title: "שגיאה בבחירת מאמן",
        description: error.message?.includes("maximum") 
          ? "למאמן זה כבר 4 מתאמנים, אנא בחר מאמן אחר"
          : error.message,
        variant: "destructive",
      });
    }
  };

  const getAvailabilityColor = (count: number) => {
    if (count >= 4) return "text-destructive";
    if (count >= 3) return "text-yellow-500";
    return "text-green-500";
  };

  const getAvailabilityBg = (count: number) => {
    if (count >= 4) return "bg-destructive/10";
    if (count >= 3) return "bg-yellow-500/10";
    return "bg-green-500/10";
  };

  const isLoading = loadingTrainers || loadingAssignment;

  return (
    <Layout title="בחירת מאמן" showBack>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl text-muted-foreground">
            בחר את המאמן שלך כדי להתחיל
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            לכל מאמן יכולים להיות עד 4 מתאמנים
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trainers && trainers.length > 0 ? (
          <div className="grid gap-4">
            {trainers.map((trainer, index) => (
              <Card
                key={trainer.id}
                variant={trainer.is_available ? "interactive" : "default"}
                className={`animate-fade-in ${!trainer.is_available ? "opacity-60" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl tracking-wide">
                          {trainer.name.toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {trainer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getAvailabilityBg(trainer.trainee_count)}`}>
                        <Users className={`w-4 h-4 ${getAvailabilityColor(trainer.trainee_count)}`} />
                        <span className={`font-mono font-bold ${getAvailabilityColor(trainer.trainee_count)}`}>
                          {trainer.trainee_count}/4
                        </span>
                      </div>
                      <Button
                        onClick={() => handleSelectTrainer(trainer.id)}
                        disabled={!trainer.is_available || assignToTrainer.isPending}
                        variant={trainer.is_available ? "default" : "secondary"}
                      >
                        {trainer.is_available ? (
                          <>
                            <Check className="mr-2 w-4 h-4" />
                            בחר
                          </>
                        ) : (
                          "מלא"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-display text-2xl mb-2">אין מאמנים זמינים</h3>
              <p className="text-muted-foreground">
                אנא המתן שמאמנים יירשמו למערכת
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
