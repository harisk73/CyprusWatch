import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { EmergencyPin } from "@shared/schema";

// Leaflet imports
declare global {
  interface Window {
    L: any;
  }
}

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedPinType, setSelectedPinType] = useState("fire");
  const [isMapReady, setIsMapReady] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emergencyPins } = useQuery<EmergencyPin[]>({
    queryKey: ["/api/emergency-pins"],
    refetchInterval: 30000,
  });

  const createPinMutation = useMutation({
    mutationFn: async (pinData: any) => {
      const res = await apiRequest("POST", "/api/emergency-pins", pinData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-pins"] });
      toast({
        title: "Emergency Pin Created",
        description: "Your emergency report has been submitted successfully.",
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
        description: "Failed to create emergency pin. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || isMapReady) return;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize map centered on Cyprus
      const map = window.L.map(mapRef.current).setView([35.1264, 33.4299], 10);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Map click handler for adding new pins or selecting location
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Emit custom event for emergency reporting page to listen to
        const mapClickEvent = new CustomEvent('mapClick', {
          detail: { lat, lng }
        });
        window.dispatchEvent(mapClickEvent);
        
        // Only create pins on home page (not on emergency reporting page)
        if (window.location.pathname === '/emergency-report') {
          return; // Just emit the event, don't create pin
        }
        
        if (createPinMutation.isPending) {
          toast({
            title: "Please wait",
            description: "Previous pin creation is still in progress.",
          });
          return;
        }

        createPinMutation.mutate({
          type: selectedPinType,
          latitude: lat.toString(),
          longitude: lng.toString(),
          description: `${selectedPinType} reported at coordinates`,
          location: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    loadLeaflet();
  }, [selectedPinType, createPinMutation, toast]);

  // Update pins on map when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !emergencyPins || !isMapReady) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer.options && layer.options.isEmergencyPin) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add emergency pins
    emergencyPins.forEach((pin) => {
      const iconColor = getIconColor(pin.type);
      
      const customIcon = window.L.divIcon({
        className: 'custom-pin',
        html: `<div style="background: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = window.L.marker([parseFloat(pin.latitude), parseFloat(pin.longitude)], {
        icon: customIcon,
        isEmergencyPin: true
      }).addTo(mapInstanceRef.current);

      marker.bindPopup(`
        <strong>${getPinTypeLabel(pin.type)}</strong><br>
        ${pin.description || 'No description'}<br>
        <small>Reported: ${new Date(pin.createdAt!).toLocaleString()}</small><br>
        <small>Status: ${pin.status}</small>
      `);
    });
  }, [emergencyPins, isMapReady]);

  const getIconColor = (type: string) => {
    switch (type) {
      case 'fire': return '#D32F2F';
      case 'smoke': return '#F57C00';
      case 'flood': return '#1976D2';
      case 'accident': return '#7B1FA2';
      case 'medical': return '#D32F2F';
      case 'weather': return '#388E3C';
      case 'security': return '#F57C00';
      default: return '#757575';
    }
  };

  const getPinTypeLabel = (type: string) => {
    switch (type) {
      case 'fire': return '🔥 Fire';
      case 'smoke': return '💨 Smoke';
      case 'flood': return '🌊 Flood';
      case 'accident': return '🚗 Accident';
      case 'medical': return '🚑 Medical Emergency';
      case 'weather': return '🌪️ Severe Weather';
      case 'security': return '🚨 Security Issue';
      default: return '⚠️ Other';
    }
  };

  return (
    <section id="map" className="mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-neutral-600 mb-2">
                Cyprus Emergency Map
              </CardTitle>
              <p className="text-neutral-500">
                Click on the map to report emergencies or view active incidents
              </p>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedPinType} onValueChange={setSelectedPinType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="fire">🔥 Fire</SelectItem>
                  <SelectItem value="smoke">💨 Smoke</SelectItem>
                  <SelectItem value="flood">🌊 Flood</SelectItem>
                  <SelectItem value="accident">🚗 Accident</SelectItem>
                  <SelectItem value="medical">🚑 Medical Emergency</SelectItem>
                  <SelectItem value="weather">🌪️ Severe Weather</SelectItem>
                  <SelectItem value="security">🚨 Security Issue</SelectItem>
                  <SelectItem value="other">⚠️ Other</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-primary hover:bg-primary/90">
                <MapPin className="w-4 h-4 mr-2" />
                Report Emergency
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative z-0">
            <div 
              ref={mapRef}
              className="h-96 bg-neutral-100 relative z-0"
              style={{ height: "500px" }}
            >
              {!isMapReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-neutral-500">Loading Cyprus Map...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-neutral-200">
              <h4 className="font-semibold text-neutral-600 mb-3">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emergency rounded-full"></div>
                  <span>Fire/Emergency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span>Warning/Smoke</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}