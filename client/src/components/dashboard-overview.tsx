import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Phone, CheckCircle, AlertTriangle, Route, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { Alert, Village, User } from "@shared/schema";

export default function DashboardOverview() {
  const { user } = useAuth() as { user: User | undefined };

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ["/api/villages"],
  });

  const activeAlerts = alerts?.filter(alert => alert.status === "active") || [];
  const emergencyAlerts = activeAlerts.filter(alert => alert.type === "emergency");
  const warningAlerts = activeAlerts.filter(alert => alert.type === "warning");

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-700">Emergency Dashboard</h1>
          <p className="text-neutral-500">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}. Monitor and respond to emergencies in your area.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Last updated</p>
          <p className="text-lg font-semibold text-neutral-700">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Emergencies */}
        <Card className={emergencyAlerts.length > 0 ? "border-emergency shadow-lg" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${emergencyAlerts.length > 0 ? "text-emergency" : "text-neutral-400"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emergency">{emergencyAlerts.length}</div>
            <p className="text-xs text-neutral-500">
              {emergencyAlerts.length > 0 ? "Requires immediate attention" : "No active emergencies"}
            </p>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card className={warningAlerts.length > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
            <Bell className={`h-4 w-4 ${warningAlerts.length > 0 ? "text-warning" : "text-neutral-400"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningAlerts.length}</div>
            <p className="text-xs text-neutral-500">
              {warningAlerts.length > 0 ? "Monitor situation" : "No active warnings"}
            </p>
          </CardContent>
        </Card>

        {/* Villages Covered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Villages Covered</CardTitle>
            <MapPin className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{villages?.length || 0}</div>
            <p className="text-xs text-neutral-500">
              Across Cyprus
            </p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Online</div>
            <p className="text-xs text-neutral-500">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === "emergency" ? "bg-emergency" : 
                        alert.type === "warning" ? "bg-warning" : "bg-info"
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-neutral-500">
                          {alert.targetVillages?.length || 0} village{(alert.targetVillages?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        alert.type === "emergency" ? "bg-emergency/20 text-emergency" :
                        alert.type === "warning" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"
                      }
                    >
                      {alert.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>No recent alerts</p>
                <p className="text-sm">All quiet in your area</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/emergency-report" className="w-full">
                <Button
                  variant="outline"
                  className="w-full p-4 h-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:bg-primary/10"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <h4 className="font-semibold text-neutral-700">Report Emergency</h4>
                      <p className="text-sm text-neutral-500">Open emergency reporting page</p>
                    </div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/emergency-services" className="w-full">
                <Button
                  variant="outline"
                  className="w-full p-4 h-auto bg-gradient-to-r from-blue-50 to-blue-25 border-blue-200 hover:bg-blue-100"
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <h4 className="font-semibold text-neutral-700">Emergency Services</h4>
                      <p className="text-sm text-neutral-500">Call Cyprus emergency services</p>
                    </div>
                  </div>
                </Button>
              </Link>
              
              {user?.isVillageAdmin && (
                <Link href="/evacuation-planning" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full p-4 h-auto bg-gradient-to-r from-purple-50 to-purple-25 border-purple-200 hover:bg-purple-100"
                  >
                    <div className="flex items-center space-x-3">
                      <Route className="h-8 w-8 text-purple-600" />
                      <div className="text-left">
                        <h4 className="font-semibold text-neutral-700">Evacuation Planning</h4>
                        <p className="text-sm text-neutral-500">Manage evacuation routes (Admin)</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              )}

              {user?.isVillageAdmin && (
                <Button
                  variant="outline"
                  className="w-full p-4 h-auto bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 hover:bg-warning/10"
                  onClick={() => {/* TODO: Add admin alert functionality */}}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="h-8 w-8 text-warning" />
                    <div className="text-left">
                      <h4 className="font-semibold text-neutral-700">Send Alert</h4>
                      <p className="text-sm text-neutral-500">Broadcast alerts to villages in your area</p>
                    </div>
                  </div>
                </Button>
              )}

              {user?.isVillageAdmin && (
                <Link href="/sms-alerts" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full p-4 h-auto bg-gradient-to-r from-green-50 to-green-25 border-green-200 hover:bg-green-100"
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <h4 className="font-semibold text-neutral-700">SMS Alerts</h4>
                        <p className="text-sm text-neutral-500">Send emergency SMS notifications</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </section>
  );
}