import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTrainersWithAvailability } from "@/hooks/useTrainerAssignments";
import { useAuth } from "@/contexts/AuthContext";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferTraineeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traineeName: string;
  traineeId: string;
  onTransfer: (toTrainerId: string) => void;
  isPending?: boolean;
}

export function TransferTraineeDialog({
  open,
  onOpenChange,
  traineeName,
  traineeId,
  onTransfer,
  isPending,
}: TransferTraineeDialogProps) {
  const { user } = useAuth();
  const { data: trainers, isLoading } = useTrainersWithAvailability();
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");

  // Filter out current trainer from the list
  const availableTrainers = trainers?.filter((t) => t.id !== user?.id) || [];

  const handleTransfer = () => {
    if (selectedTrainerId) {
      onTransfer(selectedTrainerId);
    }
  };

  const getAvailabilityColor = (count: number) => {
    if (count >= 4) return "text-destructive";
    if (count >= 3) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            העברת מתאמן
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            העברת <span className="font-semibold text-foreground">{traineeName}</span> למאמן אחר:
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : availableTrainers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין מאמנים אחרים זמינים</p>
            </div>
          ) : (
            <RadioGroup
              value={selectedTrainerId}
              onValueChange={setSelectedTrainerId}
              className="space-y-3"
            >
              {availableTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse rounded-lg border p-4 transition-colors",
                    trainer.is_available
                      ? "cursor-pointer hover:bg-accent"
                      : "cursor-not-allowed opacity-50",
                    selectedTrainerId === trainer.id && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem
                    value={trainer.id}
                    id={trainer.id}
                    disabled={!trainer.is_available}
                  />
                  <Label
                    htmlFor={trainer.id}
                    className={cn(
                      "flex-1 flex items-center justify-between",
                      trainer.is_available ? "cursor-pointer" : "cursor-not-allowed"
                    )}
                  >
                    <div>
                      <p className="font-medium">{trainer.name}</p>
                      <p className="text-sm text-muted-foreground">{trainer.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono font-bold",
                          getAvailabilityColor(trainer.trainee_count)
                        )}
                      >
                        {trainer.trainee_count}/4
                      </span>
                      {!trainer.is_available && (
                        <span className="text-xs text-destructive">מלא</span>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedTrainerId || isPending}
          >
            {isPending ? "מעביר..." : "העבר מתאמן"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
