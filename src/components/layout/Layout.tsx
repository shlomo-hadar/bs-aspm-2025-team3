import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Users,
  LayoutGrid,
  BarChart3,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
}

export function Layout({ children, showBack, title }: LayoutProps) {
  const { profile, signOut, isTrainer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const trainerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/trainees", label: "Trainees", icon: Users },
    { href: "/live", label: "Live View", icon: Dumbbell },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  const traineeLinks = [
    { href: "/my-workouts", label: "My Workouts", icon: Dumbbell },
    { href: "/live", label: "Live View", icon: LayoutGrid },
  ];

  const links = isTrainer ? trainerLinks : traineeLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl tracking-wider text-foreground">
                  FITSPLIT
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {profile?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => {
                    navigate(link.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="mb-4 px-4">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleSignOut}
            >
              <LogOut size={20} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            {title && (
              <h2 className="font-display text-3xl tracking-wide">{title}</h2>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
