import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useSessionLogs } from "@/hooks/useSessionLogs";
import { useProfile } from "@/hooks/useProfiles";
import { TraineeHistoryStats } from "@/components/TraineeHistoryStats";

export default function TraineeHistoryPage() {
  const { traineeId } = useParams<{ traineeId: string }>();
  
  const { data: sessionLogs, isLoading: loadingLogs } = useSessionLogs(traineeId);
  const { data: trainee } = useProfile(traineeId);

  if (loadingLogs) {
    return (
      <Layout title="LOADING..." showBack>
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={trainee ? `${trainee.name.toUpperCase()} HISTORY` : "WORKOUT HISTORY"} 
      showBack
    >
      <div className="max-w-4xl mx-auto">
        <TraineeHistoryStats 
          sessionLogs={sessionLogs || []} 
          traineeName={trainee?.name}
        />
      </div>
    </Layout>
  );
}
