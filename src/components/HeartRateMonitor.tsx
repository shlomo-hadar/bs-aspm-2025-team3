import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeartRateMonitorProps {
  className?: string;
  compact?: boolean;
}

export function HeartRateMonitor({ className, compact = false }: HeartRateMonitorProps) {
  const [bpm, setBpm] = useState(95);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate heart rate fluctuation every 2 seconds
    const interval = setInterval(() => {
      // Generate realistic heart rate between 80-140 BPM
      const baseBpm = 100;
      const variation = Math.random() * 60 - 20; // -20 to +40
      const newBpm = Math.round(baseBpm + variation);
      setBpm(Math.max(80, Math.min(140, newBpm)));
      
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 150);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Determine zone based on BPM
  const getZone = () => {
    if (bpm < 100) return { name: "WARM UP", color: "text-success" };
    if (bpm < 120) return { name: "FAT BURN", color: "text-warning" };
    return { name: "CARDIO", color: "text-destructive" };
  };

  const zone = getZone();

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Heart
          className={cn(
            "w-5 h-5 text-destructive transition-transform duration-150",
            isAnimating && "scale-125"
          )}
          fill="currentColor"
        />
        <span className="font-display text-lg">{bpm}</span>
        <span className="text-xs text-muted-foreground">BPM</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 rounded-xl bg-card border border-border relative overflow-hidden",
        className
      )}
    >
      {/* Animated pulse background */}
      <div
        className={cn(
          "absolute inset-0 bg-destructive/10 transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center transition-transform duration-150",
                isAnimating && "scale-110"
              )}
            >
              <Heart
                className={cn(
                  "w-6 h-6 text-destructive transition-transform duration-150",
                  isAnimating && "scale-125"
                )}
                fill="currentColor"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Heart Rate
              </p>
              <p className="text-xs text-muted-foreground">Simulated Sensor</p>
            </div>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium bg-card border border-border",
              zone.color
            )}
          >
            {zone.name}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-6xl text-glow">{bpm}</span>
          <span className="text-xl text-muted-foreground">BPM</span>
        </div>

        {/* Fake ECG line */}
        <div className="mt-4 h-12 relative overflow-hidden">
          <svg
            viewBox="0 0 200 50"
            className="w-full h-full animate-pulse"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              points="0,25 20,25 25,25 30,15 35,35 40,10 45,40 50,25 55,25 70,25 75,25 80,15 85,35 90,10 95,40 100,25 105,25 120,25 125,25 130,15 135,35 140,10 145,40 150,25 155,25 170,25 175,25 180,15 185,35 190,10 195,40 200,25"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
