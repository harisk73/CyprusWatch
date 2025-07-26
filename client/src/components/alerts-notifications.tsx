import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, MapPin, Users, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminPanel from "@/components/admin-panel";
import type { Alert, User } from "@shared/schema";

export default function AlertsNotifications() {
  const { user } = useAuth() as { user: User | undefined };

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="text-emergency text-lg" />;
      case "warning":
        return <AlertTriangle className="text-warning text-lg" />;
      default:
        return <Info className="text-neutral-400 text-lg" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-emergency/10 border-l-4 border-emergency";
      case "warning":
        return "bg-warning/10 border-l-4 border-warning";
      default:
        return "bg-neutral-50 border-l-4 border-neutral-300";
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now.getTime() - alertDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <section id="alerts" className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-bold text-neutral-600">Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`flex items-start space-x-4 p-4 rounded-lg ${getAlertColor(alert.type)}`}>
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-neutral-600">{alert.title}</h4>
                        <span className="text-xs text-neutral-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(alert.createdAt as string)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-neutral-500">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {alert.targetVillages?.length || 0} village{(alert.targetVillages?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <Badge variant="secondary" className={
                          alert.status === "active" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                        }>
                          {alert.status === "active" ? "Active" : "Resolved"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No alerts in your area</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Panel (Conditional Display) */}
        {user?.isVillageAdmin && <AdminPanel />}
        
        {/* Regular user notification preferences if not admin */}
        {!user?.isVillageAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-neutral-600">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-neutral-500 mb-4">
                  Manage your notification settings in your profile page.
                </p>
                <Button variant="outline" className="w-full">
                  Update Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
