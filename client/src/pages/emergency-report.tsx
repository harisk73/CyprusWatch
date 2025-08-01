import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Send, MapPin, Crosshair, ArrowLeft, Home, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link, useLocation } from "wouter";
import NavigationHeader from "@/components/navigation-header";
import InteractiveMap from "@/components/interactive-map";
import PhoneVerification from "@/components/phone-verification";
import AntiFraudInfo from "@/components/anti-fraud-info";
import type { User } from "@shared/schema";

export default function EmergencyReport() {
  const [, setLocation] = useLocation();
  const { user } = useAuth() as { user: User | undefined };
  const { t } = useLanguage();
  const [reportForm, setReportForm] = useState({
    type: "",
    location: "",
    description: "",
    coordinates: { lat: "", lng: "" },
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"manual" | "gps">("manual");
  const [showVerification, setShowVerification] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Redirect back to home after successful submission
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: any) => {
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
      
      // Check for phone verification requirement
      if (error.message && error.message.includes("Phone verification required")) {
        setShowVerification(true);
        toast({
          title: "Phone Verification Required",
          description: "You need to verify your phone number before posting emergency alerts.",
          variant: "destructive",
        });
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
    
    // Check if user phone is verified
    if (!user?.phoneVerified) {
      setShowVerification(true);
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before submitting emergency reports.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reportForm.type || !reportForm.location.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please select emergency type and provide location.",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate(reportForm);
  };

  // Listen for map clicks to set location
  useEffect(() => {
    const handleMapClick = (event: CustomEvent) => {
      if (event.detail && event.detail.lat && event.detail.lng) {
        setReportForm(prev => ({
          ...prev,
          coordinates: { 
            lat: event.detail.lat.toString(), 
            lng: event.detail.lng.toString() 
          },
          location: `Map Location: ${event.detail.lat.toFixed(6)}, ${event.detail.lng.toFixed(6)}`
        }));
        toast({
          title: "Location Selected",
          description: "Location selected from map.",
        });
      }
    };

    window.addEventListener('mapClick', handleMapClick as EventListener);
    return () => {
      window.removeEventListener('mapClick', handleMapClick as EventListener);
    };
  }, [toast]);

  return (
    <div className="font-inter bg-neutral-100 min-h-screen">
      <NavigationHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-emergency" />
              <h1 className="text-3xl font-bold text-neutral-700">Emergency Report</h1>
            </div>
          </div>
          <p className="text-neutral-500">
            Report an emergency incident. Use the quick access buttons below or scroll down to the form.
          </p>
          
          {/* Quick Access Buttons */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="h-16 flex flex-col items-center justify-center bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
            >
              <Crosshair className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">
                {isGettingLocation ? "Getting GPS..." : "GPS Location"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setLocationMethod("manual");
                // Scroll to location input
                const locationInput = document.getElementById("location");
                locationInput?.focus();
              }}
              className="h-16 flex flex-col items-center justify-center bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
            >
              <MapPin className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">Manual Entry</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Scroll to map
                const mapCard = document.querySelector('[data-map-card]');
                mapCard?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-16 flex flex-col items-center justify-center bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700"
            >
              <Map className="h-6 w-6 mb-1" />
              <span className="text-sm font-medium">Use Map</span>
            </Button>
          </div>
        </div>

        {/* Phone Verification Section */}
        {showVerification && (
          <div className="mb-8">
            <PhoneVerification
              userPhone={user?.phone}
              onVerificationComplete={() => {
                setShowVerification(false);
                toast({
                  title: "Verification Complete",
                  description: "You can now submit emergency reports!",
                });
              }}
            />
          </div>
        )}

        <div className="space-y-8">
          {/* Emergency Form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-emergency" />
                <span>Emergency Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Emergency Type */}
                <div>
                  <Label htmlFor="emergency-type">Emergency Type *</Label>
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

                {/* Location Selection */}
                <div>
                  <Label htmlFor="location">Location *</Label>
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
                    </div>

                    {/* Location Input */}
                    <Input
                      id="location"
                      value={reportForm.location}
                      onChange={(e) => setReportForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={
                        locationMethod === "manual" ? "Describe the location..." :
                        "GPS location will appear here, or click on map..."
                      }
                      readOnly={locationMethod === "gps"}
                    />

                    {/* Map Instructions */}
                    <div className="text-sm text-neutral-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <strong>💡 Tip:</strong> Click anywhere on the map to the right to automatically set the location coordinates.
                    </div>

                    {/* Coordinates Display */}
                    {(reportForm.coordinates.lat && reportForm.coordinates.lng) && (
                      <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
                        <strong>Coordinates:</strong> {reportForm.coordinates.lat}, {reportForm.coordinates.lng}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe what you see or what happened..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3">
                  <Link href="/" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createReportMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {createReportMutation.isPending ? "Reporting..." : "Submit Report"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Interactive Map */}
          <Card className="w-full" data-map-card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Location Map</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-neutral-600 mb-4">
                Click anywhere on the map to set the emergency location.
              </div>
              <InteractiveMap />
            </CardContent>
          </Card>
        </div>

        {/* Anti-Fraud Information Section */}
        <div className="mt-8">
          <AntiFraudInfo />
        </div>
      </main>
    </div>
  );
}