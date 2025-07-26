import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Alert, Village } from "@shared/schema";

export default function DashboardOverview() {
  const { user } = useAuth();

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ["/api/villages"],
  });

  const userVillage = villages?.find(v => v.id === user?.villageId);
  const activeAlerts = alerts?.filter(alert => alert.status === "active") || [];
  const emergencyAlerts = activeAlerts.filter(alert => alert.type === "emergency");
  const warningAlerts = activeAlerts.filter(alert => alert.type === "warning");

  return (
    <section id="dashboard" className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Alerts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergencyAlerts.length > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-emergency/10 rounded-lg">
                  <div className="w-3 h-3 bg-emergency rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">Emergency Alert</p>
                    <p className="text-xs text-neutral-500">{emergencyAlerts.length} active</p>
                  </div>
                </div>
              )}
              {warningAlerts.length > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">Weather Warning</p>
                    <p className="text-xs text-neutral-500">{warningAlerts.length} active</p>
                  </div>
                </div>
              )}
              {activeAlerts.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No emergency alerts in your area</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Village Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Village</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{userVillage?.name || "Not Set"}</p>
              <p className="text-sm text-neutral-500">{userVillage?.district || ""}</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Status: Safe
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Contacts</CardTitle>
            <Phone className="h-4 w-4 text-emergency" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Police</span>
                <span className="text-sm font-mono font-medium">199</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Fire Department</span>
                <span className="text-sm font-mono font-medium">199</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Medical Emergency</span>
                <span className="text-sm font-mono font-medium">199</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">Your Emergency Contact</span>
                <span className="text-sm font-medium">
                  {user?.emergencyContactPhone || "Not Set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
