import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import TrainerDashboard from "./pages/TrainerDashboard";
import TraineesPage from "./pages/TraineesPage";
import PlanWorkoutPage from "./pages/PlanWorkoutPage";
import LiveViewPage from "./pages/LiveViewPage";
import ReportsPage from "./pages/ReportsPage";
import TraineeWorkoutsPage from "./pages/TraineeWorkoutsPage";
import SelectTrainerPage from "./pages/SelectTrainerPage";
import TraineeHistoryPage from "./pages/TraineeHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute requireTrainer><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/trainees" element={<ProtectedRoute requireTrainer><TraineesPage /></ProtectedRoute>} />
            <Route path="/trainees/:traineeId/plan" element={<ProtectedRoute requireTrainer><PlanWorkoutPage /></ProtectedRoute>} />
            <Route path="/trainees/:traineeId/history" element={<ProtectedRoute requireTrainer><TraineeHistoryPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requireTrainer><ReportsPage /></ProtectedRoute>} />
            <Route path="/my-workouts" element={<ProtectedRoute><TraineeWorkoutsPage /></ProtectedRoute>} />
            <Route path="/select-trainer" element={<ProtectedRoute><SelectTrainerPage /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveViewPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
