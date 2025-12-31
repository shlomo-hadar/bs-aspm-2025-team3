import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyTrainees, useRemoveTrainee, useTransferTrainee } from "@/hooks/useTrainerAssignments";
import { User, ChevronRight, UserPlus, Users, Trash2, ArrowRightLeft, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransferTraineeDialog } from "@/components/TransferTraineeDialog";

export default function TraineesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: assignments, isLoading } = useMyTrainees();
  const removeTrainee = useRemoveTrainee();
  const transferTrainee = useTransferTrainee();
  
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<{ id: string; name: string } | null>(null);

  const traineeCount = assignments?.length || 0;

  const handleRemoveTrainee = async (assignmentId: string, traineeName: string) => {
    try {
      await removeTrainee.mutateAsync(assignmentId);
      toast({
        title: "מתאמן הוסר",
        description: `${traineeName} הוסר מרשימת המתאמנים שלך`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה להסיר את המתאמן",
        variant: "destructive",
      });
    }
  };

  const handleOpenTransferDialog = (traineeId: string, traineeName: string) => {
    setSelectedTrainee({ id: traineeId, name: traineeName });
    setTransferDialogOpen(true);
  };

  const handleTransfer = async (toTrainerId: string) => {
    if (!selectedTrainee) return;
    
    try {
      await transferTrainee.mutateAsync({
        traineeId: selectedTrainee.id,
        toTrainerId,
      });
      toast({
        title: "מתאמן הועבר",
        description: `${selectedTrainee.name} הועבר למאמן אחר`,
      });
      setTransferDialogOpen(false);
      setSelectedTrainee(null);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה להעביר את המתאמן",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="TRAINEES" showBack>
      <div className="max-w-4xl mx-auto">
        {/* Capacity indicator */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-display">CAPACITY</span>
            </div>
            <div className={`font-mono text-xl font-bold ${traineeCount >= 4 ? "text-destructive" : traineeCount >= 3 ? "text-yellow-500" : "text-green-500"}`}>
              {traineeCount}/4
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assignments && assignments.length > 0 ? (
          <div className="grid gap-4">
            {assignments.map((assignment, index) => (
              <Card
                key={assignment.id}
                variant="interactive"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => navigate(`/trainees/${assignment.trainee.id}/plan`)}
                    >
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl tracking-wide">
                          {assignment.trainee.name.toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.trainee.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trainees/${assignment.trainee.id}/history`);
                        }}
                        title="היסטוריית אימונים"
                      >
                        <History className="w-5 h-5 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTransferDialog(assignment.trainee.id, assignment.trainee.name);
                        }}
                        title="העבר למאמן אחר"
                      >
                        <ArrowRightLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTrainee(assignment.id, assignment.trainee.name);
                        }}
                        disabled={removeTrainee.isPending}
                        title="הסר מתאמן"
                      >
                        <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                      </Button>
                      <Button 
                        variant="default"
                        onClick={() => navigate(`/trainees/${assignment.trainee.id}/plan`)}
                      >
                        Plan Workout
                        <ChevronRight className="ml-2" size={18} />
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
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-display text-2xl mb-2">NO TRAINEES YET</h3>
              <p className="text-muted-foreground mb-6">
                Trainees will appear here once they choose you as their trainer
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transfer Dialog */}
        {selectedTrainee && (
          <TransferTraineeDialog
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
            traineeName={selectedTrainee.name}
            traineeId={selectedTrainee.id}
            onTransfer={handleTransfer}
            isPending={transferTrainee.isPending}
          />
        )}
      </div>
    </Layout>
  );
}
