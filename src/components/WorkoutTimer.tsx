import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pause, Play, Coffee, Square, Timer } from "lucide-react";
import {
  useWorkoutTimer,
  useStartTimer,
  useUpdateTimerStatus,
  useStopTimer,
  TimerStatus,
} from "@/hooks/useWorkoutTimer";
import { cn } from "@/lib/utils";

interface WorkoutTimerProps {
  traineeId: string;
  compact?: boolean;
}

export function WorkoutTimer({ traineeId, compact = false }: WorkoutTimerProps) {
  const { data: timer, isLoading } = useWorkoutTimer(traineeId);
  const startTimer = useStartTimer();
  const updateStatus = useUpdateTimerStatus();
  const stopTimer = useStopTimer();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [breakReason, setBreakReason] = useState("");

  // Calculate elapsed time
  useEffect(() => {
    if (!timer || timer.status === "stopped") {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const startedAt = new Date(timer.started_at).getTime();
      const now = Date.now();
      let elapsed = Math.floor((now - startedAt) / 1000);

      // Subtract total paused time
      elapsed -= timer.total_paused_seconds || 0;

      // If currently paused/break, subtract current pause duration
      if ((timer.status === "paused" || timer.status === "break") && timer.paused_at) {
        const pausedAt = new Date(timer.paused_at).getTime();
        elapsed -= Math.floor((now - pausedAt) / 1000);
      }

      setElapsedSeconds(Math.max(0, elapsed));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [elapsedSeconds]);

  const statusConfig: Record<TimerStatus, { color: string; icon: string; label: string }> = {
    active: { color: "text-green-500", icon: "🟢", label: "פעיל" },
    paused: { color: "text-yellow-500", icon: "⏸️", label: "הושהה" },
    break: { color: "text-orange-500", icon: "☕", label: "הפסקה" },
    stopped: { color: "text-muted-foreground", icon: "⏹️", label: "עצר" },
  };

  const handleStart = async () => {
    try {
      await startTimer.mutateAsync(traineeId);
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const handlePause = async () => {
    try {
      await updateStatus.mutateAsync({ traineeId, status: "paused" });
    } catch (error) {
      console.error("Failed to pause timer:", error);
    }
  };

  const handleBreak = async () => {
    try {
      await updateStatus.mutateAsync({
        traineeId,
        status: "break",
        breakReason: breakReason || undefined,
      });
      setShowBreakDialog(false);
      setBreakReason("");
    } catch (error) {
      console.error("Failed to set break:", error);
    }
  };

  const handleResume = async () => {
    try {
      await updateStatus.mutateAsync({ traineeId, status: "active" });
    } catch (error) {
      console.error("Failed to resume timer:", error);
    }
  };

  const handleStop = async () => {
    try {
      await stopTimer.mutateAsync(traineeId);
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Timer className="w-4 h-4 animate-pulse" />
        <span>--:--:--</span>
      </div>
    );
  }

  // No timer - show start button
  if (!timer) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        onClick={handleStart}
        disabled={startTimer.isPending}
        className="gap-2"
      >
        <Play className="w-4 h-4" />
        {!compact && "התחל אימון"}
      </Button>
    );
  }

  const currentStatus = timer.status as TimerStatus;
  const config = statusConfig[currentStatus];
  const isPaused = currentStatus === "paused" || currentStatus === "break";
  const isUpdating = updateStatus.isPending || stopTimer.isPending;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={cn("font-mono text-lg font-bold", config.color)}>
          {formattedTime}
        </div>
        <span className="text-sm">{config.icon}</span>
        {isPaused ? (
          <Button size="icon" variant="ghost" onClick={handleResume} disabled={isUpdating}>
            <Play className="w-4 h-4" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" onClick={handlePause} disabled={isUpdating}>
            <Pause className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className={cn("font-mono text-4xl font-bold tracking-wider", config.color)}>
            {formattedTime}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>{config.icon}</span>
            <span>{config.label}</span>
            {timer.break_reason && (
              <span className="text-orange-500">- {timer.break_reason}</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          {isPaused ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleResume}
              disabled={isUpdating}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              המשך
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                disabled={isUpdating}
                className="gap-2"
              >
                <Pause className="w-4 h-4" />
                השהה
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBreakDialog(true)}
                disabled={isUpdating}
                className="gap-2"
              >
                <Coffee className="w-4 h-4" />
                הפסקה
              </Button>
            </>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            disabled={isUpdating}
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            סיים
          </Button>
        </div>
      </div>

      {/* Break Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הפסקה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="סיבת ההפסקה (אופציונלי)"
              value={breakReason}
              onChange={(e) => setBreakReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBreakDialog(false)}>
              ביטול
            </Button>
            <Button onClick={handleBreak} disabled={updateStatus.isPending}>
              התחל הפסקה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
