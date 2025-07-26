import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Send, MapPin, Crosshair, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface EmergencyModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EmergencyModal({ open, onOpenChange }: EmergencyModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: "",
    location: "",
    description: "",
    coordinates: { lat: "", lng: "" },
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"manual" | "gps" | "map">("manual");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const actualOpen = open !== undefined ? open : isOpen;
  const actualOnOpenChange = onOpenChange || setIsOpen;

  // Function to get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setReportForm(prev => ({
          ...prev,
          coordinates: { lat: latitude.toString(), lng: longitude.toString() },
          location: `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setLocationMethod("gps");
        setIsGettingLocation(false);
        toast({
          title: "Location Found",
          description: "Your current location has been captured.",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      // Use provided coordinates or default to center of Cyprus
      const latitude = reportData.coordinates.lat || "35.1264";
      const longitude = reportData.coordinates.lng || "33.4299";
      
      const res = await apiRequest("POST", "/api/emergency-pins", {
        type: reportData.type,
        location: reportData.location,
        description: reportData.description,
        latitude,
        longitude,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-pins"] });
      toast({
        title: "Emergency Report Submitted",
        description: "Your emergency report has been submitted successfully. Authorities have been notified.",
      });
      setReportForm({ type: "", location: "", description: "", coordinates: { lat: "", lng: "" } });
      setLocationMethod("manual");
      actualOnOpenChange(false);
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
        description: "Failed to submit emergency report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.type || !reportForm.location.trim() || !reportForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate(reportForm);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-14 h-14 rounded-full bg-emergency hover:bg-emergency/90 shadow-lg hover:scale-110 transition-all duration-300"
              title="Quick Emergency Report"
            >
              <AlertTriangle className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="text-center mb-4">
                <AlertTriangle className="h-12 w-12 text-emergency mx-auto mb-4" />
                <DialogTitle className="text-xl font-bold text-neutral-600">
                  Quick Emergency Report
                </DialogTitle>
                <DialogDescription className="text-neutral-500 text-sm mt-2">
                  Report an emergency in your area quickly. Your location helps emergency services respond faster.
                </DialogDescription>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="emergency-type">Emergency Type</Label>
                <Select
                  value={reportForm.type}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emergency type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">🔥 Fire</SelectItem>
                    <SelectItem value="medical">🚑 Medical Emergency</SelectItem>
                    <SelectItem value="accident">🚗 Traffic Accident</SelectItem>
                    <SelectItem value="weather">🌪️ Severe Weather</SelectItem>
                    <SelectItem value="security">🚨 Security Issue</SelectItem>
                    <SelectItem value="other">⚠️ Other Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="space-y-3">
                  {/* Location Method Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={locationMethod === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocationMethod("manual")}
                      className="flex-1"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Manual
                    </Button>
                    <Button
                      type="button"
                      variant={locationMethod === "gps" ? "default" : "outline"}
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="flex-1"
                    >
                      <Crosshair className="w-4 h-4 mr-1" />
                      {isGettingLocation ? "Getting..." : "GPS"}
                    </Button>
                    <Button
                      type="button"
                      variant={locationMethod === "map" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setLocationMethod("map");
                        toast({
                          title: "Map Selection",
                          description: "Click on the main map to select a location, then come back to this form.",
                        });
                      }}
                      className="flex-1"
                    >
                      <Map className="w-4 h-4 mr-1" />
                      Map
                    </Button>
                  </div>

                  {/* Location Input */}
                  <Input
                    id="location"
                    value={reportForm.location}
                    onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={
                      locationMethod === "manual" ? "Describe the location..." :
                      locationMethod === "gps" ? "GPS location will appear here..." :
                      "Click on map to select location..."
                    }
                    readOnly={locationMethod === "gps"}
                  />

                  {/* Coordinates Display */}
                  {(reportForm.coordinates.lat && reportForm.coordinates.lng) && (
                    <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
                      <strong>Coordinates:</strong> {reportForm.coordinates.lat}, {reportForm.coordinates.lng}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe what you see..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => actualOnOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createReportMutation.isPending}
                  className="flex-1 bg-emergency hover:bg-emergency/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createReportMutation.isPending ? "Reporting..." : "Report Now"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}