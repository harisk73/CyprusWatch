import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import type { Alert as AlertType } from "@shared/schema";

export default function EmergencyBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: alerts } = useQuery<AlertType[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const emergencyAlerts = alerts?.filter(alert => 
    alert.type === "emergency" && alert.status === "active"
  ) || [];

  if (emergencyAlerts.length === 0 || dismissed) {
    return null;
  }

  const latestAlert = emergencyAlerts[0];

  return (
    <Alert className="bg-emergency text-white border-emergency rounded-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
          <div>
            <p className="font-semibold">EMERGENCY ALERT</p>
            <AlertDescription className="text-white/90">
              {latestAlert.message}
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-white hover:text-neutral-200 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}