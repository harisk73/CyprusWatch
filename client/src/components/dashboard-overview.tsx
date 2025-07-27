import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/language-context";
import { Link } from "wouter";
import type { Alert, Village, User, EmergencyPin } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function DashboardOverview() {
  const { user } = useAuth() as { user: User | undefined };
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showAllAlerts, setShowAllAlerts] = useState(false);

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

  // Function to scroll to the map section
  const scrollToMap = () => {
    const mapSection = document.getElementById('emergency-map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column - Emergency Status */}
        <div className="space-y-6">
          {/* Active Emergencies */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeEmergencyPins.length > 0 ? "border-emergency shadow-lg hover:shadow-xl" : "hover:border-gray-300"
            }`}
            onClick={scrollToMap}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="tracking-tight text-[18px] font-bold">
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
                  ? t("dashboard.requiresAttention") + " • " + t("dashboard.clickToViewMap")
                  : t("dashboard.noActiveEmergencies")}
              </p>
            </CardContent>
          </Card>

          {/* Active Warnings */}
          <Card className={warningAlerts.length > 0 ? "border-warning" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="tracking-tight text-[18px] font-bold">
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
        </div>

        {/* Right Column - Quick Actions */}
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

      {/* Second Row - Recent Alerts and Admin Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Alerts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl">{t("dashboard.recentAlerts")}</CardTitle>
            {emergencyPins && emergencyPins.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="text-xs"
              >
                {showAllAlerts ? "Show Less" : "View More"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {emergencyPins && emergencyPins.length > 0 ? (
              <div className="space-y-3">
                {emergencyPins
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .slice(0, showAllAlerts ? emergencyPins.length : 5)
                  .map((pin) => (
                  <div
                    key={pin.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
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
                      className={`text-xs ${
                        pin.type === "fire" || pin.type === "medical"
                          ? "bg-emergency/20 text-emergency"
                          : pin.type === "accident" || pin.type === "weather"
                            ? "bg-warning/20 text-warning"
                            : "bg-info/20 text-info"
                      } ${
                        pin.status === "resolved" ? "bg-green-100 text-green-700" : ""
                      }`}
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

        {/* Admin Management Card */}
        {user?.isVillageAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("dashboard.manageActiveAlerts")}</CardTitle>
              <p className="text-sm text-neutral-600">{t("dashboard.adminAlertsDescription")}</p>
            </CardHeader>
            <CardContent>
              {activeEmergencyPins.length > 0 ? (
                <div className="space-y-4">
                  {activeEmergencyPins
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    .map((pin) => (
                    <AdminAlertCard key={pin.id} pin={pin} onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/emergency-pins"] });
                    }} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                  <p>{t("dashboard.noActiveAlerts")}</p>
                  <p className="text-sm">{t("dashboard.allQuiet")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>


    </section>
  );
}

// Admin Alert Card Component
interface AdminAlertCardProps {
  pin: EmergencyPin;
  onUpdate: () => void;
}

function AdminAlertCard({ pin, onUpdate }: AdminAlertCardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    type: pin.type,
    description: pin.description || "",
    location: pin.location || "",
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PATCH", `/api/emergency-pins/${pin.id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: "Status Updated",
        description: "Emergency alert status has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePinMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const res = await apiRequest("PUT", `/api/emergency-pins/${pin.id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      onUpdate();
      setIsEditOpen(false);
      toast({
        title: "Alert Updated",
        description: "Emergency alert has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/emergency-pins/${pin.id}`);
      return res.json();
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: "Alert Deleted",
        description: "Emergency alert has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const getEmergencyTypeDisplay = (type: string) => {
    return t(`emergencyType.${type}`) || type;
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div
            className={`w-4 h-4 rounded-full mt-1 ${
              pin.type === "fire" || pin.type === "medical"
                ? "bg-emergency"
                : pin.type === "accident" || pin.type === "weather"
                  ? "bg-warning"
                  : "bg-info"
            }`}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-semibold text-sm">{getEmergencyTypeDisplay(pin.type)}</p>
              <Badge
                variant="secondary"
                className={
                  pin.status === "active"
                    ? "bg-emergency/20 text-emergency text-xs"
                    : "bg-neutral/20 text-neutral text-xs"
                }
              >
                {pin.status}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mb-1">{getTimeAgo(pin.createdAt || new Date())}</p>
            <div className="flex items-center space-x-1 mb-2">
              <MapPin className="h-3 w-3 text-neutral-400" />
              <p className="text-xs text-neutral-600">
                {pin.location || `${Number(pin.latitude).toFixed(4)}, ${Number(pin.longitude).toFixed(4)}`}
              </p>
            </div>
            {pin.description && (
              <p className="text-xs text-neutral-700">{pin.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          {pin.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 bg-green-50 border-green-200 hover:bg-green-100"
              onClick={() => updateStatusMutation.mutate("resolved")}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </Button>
          )}
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-2">
                <Edit className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Emergency Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={editForm.type} 
                    onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fire">🔥 Fire</SelectItem>
                      <SelectItem value="smoke">💨 Smoke</SelectItem>
                      <SelectItem value="flood">🌊 Flood</SelectItem>
                      <SelectItem value="accident">🚗 Accident</SelectItem>
                      <SelectItem value="medical">🚑 Medical</SelectItem>
                      <SelectItem value="weather">🌪️ Weather</SelectItem>
                      <SelectItem value="security">🚨 Security</SelectItem>
                      <SelectItem value="other">⚠️ Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Enter location description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => updatePinMutation.mutate(editForm)}
                    disabled={updatePinMutation.isPending}
                    className="flex-1"
                  >
                    Update Alert
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 border-red-200 hover:bg-red-50"
            onClick={() => {
              if (confirm("Are you sure you want to delete this alert?")) {
                deletePinMutation.mutate();
              }
            }}
            disabled={deletePinMutation.isPending}
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
