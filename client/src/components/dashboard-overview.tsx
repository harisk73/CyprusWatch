import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Route,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";
import type { Alert, Village, User, EmergencyPin } from "@shared/schema";

export default function DashboardOverview() {
  const { user } = useAuth() as { user: User | undefined };
  const { t } = useLanguage();

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ["/api/villages"],
  });

  const { data: emergencyPins } = useQuery<EmergencyPin[]>({
    queryKey: ["/api/emergency-pins"],
  });

  const activeAlerts =
    alerts?.filter((alert) => alert.status === "active") || [];
  const emergencyAlerts = activeAlerts.filter(
    (alert) => alert.type === "emergency",
  );
  const warningAlerts = activeAlerts.filter(
    (alert) => alert.type === "warning",
  );

  // Get active emergency pins
  const activeEmergencyPins = 
    emergencyPins?.filter((pin) => pin.status === "active") || [];

  // Helper function to get emergency type display name
  const getEmergencyTypeDisplay = (type: string) => {
    return t(`emergencyType.${type}`) || type;
  };

  // Helper function to get time ago display
  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t("dashboard.just") + " " + t("dashboard.now");
    if (diffInMinutes < 60) return `${diffInMinutes}m ${t("dashboard.ago")}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ${t("dashboard.ago")}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${t("dashboard.ago")}`;
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-700">
            {t("dashboard.title")}
          </h1>
          <p className="text-neutral-500">
            {t("dashboard.welcome")}
            {user?.firstName ? `, ${user.firstName}` : ""}.{" "}
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">
            {t("dashboard.lastUpdated")}
          </p>
          <p className="text-lg font-semibold text-neutral-700">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Emergencies */}
        <Card
          className={
            activeEmergencyPins.length > 0 ? "border-emergency shadow-lg" : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeEmergencies")}
            </CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${activeEmergencyPins.length > 0 ? "text-emergency" : "text-neutral-400"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emergency">
              {activeEmergencyPins.length}
            </div>
            <p className="text-xs text-neutral-500">
              {activeEmergencyPins.length > 0
                ? t("dashboard.requiresAttention")
                : t("dashboard.noActiveEmergencies")}
            </p>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card className={warningAlerts.length > 0 ? "border-warning" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeWarnings")}
            </CardTitle>
            <Bell
              className={`h-4 w-4 ${warningAlerts.length > 0 ? "text-warning" : "text-neutral-400"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {warningAlerts.length}
            </div>
            <p className="text-xs text-neutral-500">
              {warningAlerts.length > 0
                ? t("dashboard.monitorSituation")
                : t("dashboard.noActiveWarnings")}
            </p>
          </CardContent>
        </Card>

        {/* Villages Covered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.villagesCovered")}
            </CardTitle>
            <MapPin className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {villages?.length || 0}
            </div>
            <p className="text-xs text-neutral-500">
              {t("dashboard.acrossCyprus")}
            </p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.systemStatus")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {t("dashboard.online")}
            </div>
            <p className="text-xs text-neutral-500">
              {t("dashboard.allSystemsOperational")}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("dashboard.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeEmergencyPins.length > 0 ? (
              <div className="space-y-3">
                {activeEmergencyPins
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .slice(0, 3)
                  .map((pin) => (
                  <div
                    key={pin.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          pin.type === "fire" || pin.type === "medical"
                            ? "bg-emergency"
                            : pin.type === "accident" || pin.type === "weather"
                              ? "bg-warning"
                              : "bg-info"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">{getEmergencyTypeDisplay(pin.type)}</p>
                          <span className="text-xs text-neutral-400">•</span>
                          <p className="text-xs text-neutral-500">{getTimeAgo(pin.createdAt || new Date())}</p>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-neutral-400" />
                          <p className="text-xs text-neutral-500 truncate">
                            {pin.location || `${Number(pin.latitude).toFixed(4)}, ${Number(pin.longitude).toFixed(4)}`}
                          </p>
                        </div>
                        {pin.description && (
                          <p className="text-xs text-neutral-600 mt-1 truncate">{pin.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        pin.type === "fire" || pin.type === "medical"
                          ? "bg-emergency/20 text-emergency text-xs"
                          : pin.type === "accident" || pin.type === "weather"
                            ? "bg-warning/20 text-warning text-xs"
                            : "bg-info/20 text-info text-xs"
                      }
                    >
                      {pin.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>{t("dashboard.noRecentAlerts")}</p>
                <p className="text-sm">{t("dashboard.allQuiet")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("dashboard.quickActions")}</CardTitle>
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
                      <h4 className="font-semibold text-neutral-700">
                        {t("dashboard.reportEmergency")}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {t("dashboard.openReportingPage")}
                      </p>
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
                      <h4 className="font-semibold text-neutral-700">
                        {t("dashboard.emergencyServices")}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {t("dashboard.contactEmergencyServices")}
                      </p>
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
                        <h4 className="font-semibold text-neutral-700">
                          {t("dashboard.evacuationPlanning")}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {t("dashboard.manageEvacuationRoutes")}
                        </p>
                      </div>
                    </div>
                  </Button>
                </Link>
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
                        <h4 className="font-semibold text-neutral-700">
                          {t("dashboard.smsAlerts")}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {t("dashboard.sendEmergencySms")}
                        </p>
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
