import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke("seed-database");

      if (error) throw error;

      if (data.success) {
        setSuccess(true);
        toast.success("Database seeded successfully!", {
          description: `Added ${data.exercises} exercises. ${data.note}`,
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Seed error:", error);
      toast.error("Failed to seed database", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={success ? "outline" : "secondary"}
      onClick={handleSeed}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : success ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      {loading ? "Seeding..." : success ? "Seeded!" : "Seed Database"}
    </Button>
  );
}
