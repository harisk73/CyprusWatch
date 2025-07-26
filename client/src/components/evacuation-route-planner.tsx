import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Route, MapPin, Plus, Edit, Trash2, Navigation, Clock, Users, 
  AlertTriangle, CheckCircle, Map, Car, Bus, UserCheck 
} from "lucide-react";
import type { EvacuationRoute, InsertEvacuationRoute, Village, User } from "@shared/schema";

interface EvacuationRoutePlannerProps {
  user: User;
  villages: Village[];
}

export function EvacuationRoutePlanner({ user, villages }: EvacuationRoutePlannerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState<EvacuationRoute | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [routeForm, setRouteForm] = useState<Partial<InsertEvacuationRoute>>({
    name: '',
    description: '',
    villageId: user.villageId || '',
    routeType: 'primary',
    startPoint: null,
    endPoint: null,
    waypoints: [],
    estimatedTime: '',
    capacity: '',
    vehicleTypes: ['car'],
    hazards: '',
    priority: 'medium',
  });

  const { data: evacuationRoutes, isLoading } = useQuery<EvacuationRoute[]>({
    queryKey: ['/api/evacuation-routes'],
  });

  const createRouteMutation = useMutation({
    mutationFn: async (data: InsertEvacuationRoute) => {
      return await apiRequest('/api/evacuation-routes', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evacuation-routes'] });
      toast({
        title: "Route Created",
        description: "Evacuation route has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create evacuation route.",
        variant: "destructive",
      });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/evacuation-routes/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/evacuation-routes'] });
      toast({
        title: "Route Deleted",
        description: "Evacuation route has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting route:", error);
      toast({
        title: "Error",
        description: "Failed to delete evacuation route.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setRouteForm({
      name: '',
      description: '',
      villageId: user.villageId || '',
      routeType: 'primary',
      startPoint: null,
      endPoint: null,
      waypoints: [],
      estimatedTime: '',
      capacity: '',
      vehicleTypes: ['car'],
      hazards: '',
      priority: 'medium',
    });
  };

  const handleCreateRoute = () => {
    if (!routeForm.name || !routeForm.villageId || !routeForm.startPoint || !routeForm.endPoint) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including start and end points.",
        variant: "destructive",
      });
      return;
    }

    createRouteMutation.mutate(routeForm as InsertEvacuationRoute);
  };

  const getRouteTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-green-100 text-green-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      case 'emergency_only': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Listen for map clicks to set route points
  useEffect(() => {
    const handleMapClick = (event: CustomEvent) => {
      if (event.detail && event.detail.lat && event.detail.lng) {
        // For now, just show coordinates - in a full implementation this would integrate with the map
        const point = {
          lat: event.detail.lat,
          lng: event.detail.lng,
          name: `Point ${event.detail.lat.toFixed(4)}, ${event.detail.lng.toFixed(4)}`
        };
        
        // You could add logic here to set start/end points based on current selection mode
        console.log('Map clicked for route planning:', point);
      }
    };

    window.addEventListener('mapClick', handleMapClick as EventListener);
    return () => {
      window.removeEventListener('mapClick', handleMapClick as EventListener);
    };
  }, []);

  if (!user.isVillageAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You need administrator privileges to access evacuation route planning.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Evacuation Route Planning</span>
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

  const userVillageRoutes = evacuationRoutes?.filter(route => route.villageId === user.villageId) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Route className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Evacuation Route Planning</CardTitle>
                <p className="text-sm text-neutral-500">
                  Manage emergency evacuation routes for your village
                </p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Route
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Evacuation Route</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Route Name *</Label>
                      <Input
                        id="name"
                        value={routeForm.name}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Main Evacuation Route"
                      />
                    </div>
                    <div>
                      <Label htmlFor="routeType">Route Type *</Label>
                      <Select 
                        value={routeForm.routeType} 
                        onValueChange={(value) => setRouteForm(prev => ({ ...prev, routeType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary Route</SelectItem>
                          <SelectItem value="secondary">Secondary Route</SelectItem>
                          <SelectItem value="emergency_only">Emergency Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={routeForm.description}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Route description and special instructions"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="estimatedTime">Estimated Time</Label>
                      <Input
                        id="estimatedTime"
                        value={routeForm.estimatedTime}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                        placeholder="15 minutes"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        value={routeForm.capacity}
                        onChange={(e) => setRouteForm(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="500 people"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={routeForm.priority} 
                        onValueChange={(value) => setRouteForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hazards">Known Hazards</Label>
                    <Textarea
                      id="hazards"
                      value={routeForm.hazards}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, hazards: e.target.value }))}
                      placeholder="Narrow bridges, steep hills, flood-prone areas..."
                    />
                  </div>

                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Route Points:</strong> In a full implementation, you would click on the map to set start point, 
                      end point, and waypoints. For now, use the coordinate inputs or integrate with the interactive map component.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-3 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRoute} disabled={createRouteMutation.isPending}>
                      {createRouteMutation.isPending ? "Creating..." : "Create Route"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Routes List */}
      <div className="grid gap-4">
        {userVillageRoutes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Route className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500 mb-4">No evacuation routes created yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Route
              </Button>
            </CardContent>
          </Card>
        ) : (
          userVillageRoutes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{route.name}</h3>
                      <Badge className={getRouteTypeColor(route.routeType)}>
                        {route.routeType.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(route.priority)}>
                        {route.priority} priority
                      </Badge>
                      {route.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    
                    {route.description && (
                      <p className="text-neutral-600 mb-3">{route.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {route.estimatedTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          <span>{route.estimatedTime}</span>
                        </div>
                      )}
                      {route.capacity && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-neutral-400" />
                          <span>{route.capacity}</span>
                        </div>
                      )}
                      {route.vehicleTypes && route.vehicleTypes.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-neutral-400" />
                          <span>{route.vehicleTypes.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        <span>Route ID: {route.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {route.hazards && (
                      <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-800">Known Hazards:</p>
                            <p className="text-sm text-orange-700">{route.hazards}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Map className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteRouteMutation.mutate(route.id)}
                      disabled={deleteRouteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}