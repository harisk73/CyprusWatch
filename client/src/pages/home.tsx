import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import NavigationHeader from "@/components/navigation-header";
import EmergencyBanner from "@/components/emergency-banner";
import DashboardOverview from "@/components/dashboard-overview";
import InteractiveMap from "@/components/interactive-map";
import AlertsNotifications from "@/components/alerts-notifications";

import type { User } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth() as { 
    user: User | undefined; 
    isAuthenticated: boolean; 
    isLoading: boolean; 
  };
  const wsStatus = useWebSocket();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="font-inter bg-neutral-100 min-h-screen">
      <NavigationHeader />
      <EmergencyBanner />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardOverview />
        <div id="emergency-map-section">
          <InteractiveMap isReadOnly={true} showReportButton={true} />
        </div>
        <AlertsNotifications />
      </main>


    </div>
  );
}
