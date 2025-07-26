import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, PhoneCall, Shield, Flame, Car, AlertTriangle, Info } from "lucide-react";
import type { EmergencyService, InsertEmergencyServiceCall } from "@shared/schema";

export function EmergencyServicesPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [callDialogOpen, setCallDialogOpen] = useState(false);

  const { data: emergencyServices, isLoading } = useQuery<EmergencyService[]>({
    queryKey: ['/api/emergency-services'],
  });

  const logCallMutation = useMutation({
    mutationFn: async (data: InsertEmergencyServiceCall) => {
      return await apiRequest('/api/emergency-services/call', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-services/calls'] });
      toast({
        title: "Call Logged",
        description: "Emergency service call has been logged for your safety.",
      });
      setCallDialogOpen(false);
      setSelectedService(null);
    },
    onError: (error) => {
      console.error("Error logging call:", error);
      toast({
        title: "Error",
        description: "Failed to log emergency service call.",
        variant: "destructive",
      });
    },
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'police': return Shield;
      case 'fire': return Flame;
      case 'ambulance': return Car;
      case 'medical': return AlertTriangle;
      default: return Phone;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'police': return 'text-blue-600';
      case 'fire': return 'text-red-600';
      case 'ambulance': return 'text-green-600';
      case 'medical': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const initiateCall = (service: EmergencyService) => {
    setSelectedService(service);
    setCallDialogOpen(true);
  };

  const confirmCall = () => {
    if (!selectedService) return;

    // Open tel: link to initiate call
    window.open(`tel:${selectedService.phone}`, '_self');

    // Log the call attempt (userId will be added by the backend)
    logCallMutation.mutate({
      serviceId: selectedService.id,
      userLocation: null, // Could be enhanced with geolocation
      notes: `Called ${selectedService.name} at ${selectedService.phone}`,
    } as InsertEmergencyServiceCall);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Emergency Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryServices = emergencyServices?.filter(s => s.isPrimary) || [];
  const specializedServices = emergencyServices?.filter(s => s.isEmergency && !s.isPrimary) || [];
  const localServices = emergencyServices?.filter(s => !s.isEmergency) || [];

  return (
    <div className="space-y-6">
      {/* Primary Emergency Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Emergency Numbers</span>
          </CardTitle>
          <p className="text-sm text-neutral-500">
            Call these numbers immediately for life-threatening emergencies
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {primaryServices.map((service) => {
              const Icon = getServiceIcon(service.type);
              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${getServiceColor(service.type)}`} />
                    <div>
                      <div className="font-semibold text-red-700">{service.name}</div>
                      <div className="text-sm text-red-600">{service.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="text-lg font-bold">
                      {service.shortCode || service.phone}
                    </Badge>
                    <Button
                      onClick={() => initiateCall(service)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <PhoneCall className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Specialized Emergency Services */}
      {specializedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <Info className="h-5 w-5" />
              <span>Specialized Emergency Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {specializedServices.map((service) => {
                const Icon = getServiceIcon(service.type);
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${getServiceColor(service.type)}`} />
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {service.shortCode || service.phone}
                      </Badge>
                      <Button
                        onClick={() => initiateCall(service)}
                        size="sm"
                        variant="outline"
                      >
                        <PhoneCall className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Services */}
      {localServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Local Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {localServices.map((service) => {
                const Icon = getServiceIcon(service.type);
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${getServiceColor(service.type)}`} />
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.district && (
                          <div className="text-sm text-gray-600">District: {service.district}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{service.phone}</span>
                      <Button
                        onClick={() => initiateCall(service)}
                        size="sm"
                        variant="outline"
                      >
                        <PhoneCall className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Confirmation Dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Emergency Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedService && (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You are about to call <strong>{selectedService.name}</strong> at{" "}
                    <strong>{selectedService.phone}</strong>
                    {selectedService.isPrimary && (
                      <div className="mt-2 text-red-600 font-medium">
                        This is an emergency number. Only call if you have a genuine emergency.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
                <div className="flex space-x-3 justify-end">
                  <Button variant="outline" onClick={() => setCallDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={confirmCall} className="bg-green-600 hover:bg-green-700">
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}