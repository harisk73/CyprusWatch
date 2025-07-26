import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Village } from "@shared/schema";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [alertForm, setAlertForm] = useState({
    type: "info",
    title: "",
    message: "",
    targetVillages: [user?.villageId || ""],
    sendSms: false,
  });

  const { data: villages } = useQuery<Village[]>({
    queryKey: ["/api/villages"],
  });

  const userVillage = villages?.find(v => v.id === user?.villageId);

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const res = await apiRequest("POST", "/api/alerts", alertData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Sent",
        description: "Your alert has been sent successfully to the selected villages.",
      });
      setAlertForm({
        type: "info",
        title: "",
        message: "",
        targetVillages: [user?.villageId || ""],
        sendSms: false,
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
        description: "Failed to send alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVillageToggle = (villageId: string, checked: boolean) => {
    if (checked) {
      setAlertForm(prev => ({
        ...prev,
        targetVillages: [...prev.targetVillages, villageId]
      }));
    } else {
      setAlertForm(prev => ({
        ...prev,
        targetVillages: prev.targetVillages.filter(id => id !== villageId)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alertForm.title.trim() || !alertForm.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive",
      });
      return;
    }

    if (alertForm.targetVillages.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select at least one village.",
        variant: "destructive",
      });
      return;
    }

    createAlertMutation.mutate(alertForm);
  };

  const handleEmergencyAlert = () => {
    if (!alertForm.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an emergency message.",
        variant: "destructive",
      });
      return;
    }

    createAlertMutation.mutate({
      ...alertForm,
      type: "emergency",
      title: "EMERGENCY ALERT",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold text-neutral-600">Village Admin Panel</CardTitle>
        <Badge className="bg-primary/10 text-primary">
          Admin: {userVillage?.name || "Unknown Village"}
        </Badge>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="alert-type">Alert Type</Label>
            <Select
              value={alertForm.type}
              onValueChange={(value) => setAlertForm(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">🚨 Emergency Alert</SelectItem>
                <SelectItem value="warning">⚠️ Warning</SelectItem>
                <SelectItem value="info">ℹ️ Information</SelectItem>
                <SelectItem value="weather">🌤️ Weather Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="alert-title">Alert Title</Label>
            <Input
              id="alert-title"
              value={alertForm.title}
              onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter alert title..."
            />
          </div>

          <div>
            <Label htmlFor="target-villages">Target Villages</Label>
            <div className="space-y-2 mt-2">
              {villages?.slice(0, 5).map((village) => (
                <div key={village.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`village-${village.id}`}
                    checked={alertForm.targetVillages.includes(village.id)}
                    onCheckedChange={(checked) => handleVillageToggle(village.id, checked as boolean)}
                  />
                  <Label htmlFor={`village-${village.id}`} className="text-sm">
                    {village.name} {village.id === user?.villageId && "(Your Village)"}
                  </Label>
                </div>
              ))}
              <p className="text-xs text-neutral-500 mt-2">
                {alertForm.targetVillages.length} village{alertForm.targetVillages.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="alert-message">Alert Message</Label>
            <Textarea
              id="alert-message"
              value={alertForm.message}
              onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your alert message here..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-neutral-500 mt-1">
              {280 - alertForm.message.length} characters remaining
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms-alert"
              checked={alertForm.sendSms}
              onCheckedChange={(checked) => setAlertForm(prev => ({ ...prev, sendSms: checked as boolean }))}
            />
            <Label htmlFor="sms-alert" className="text-sm">
              Also send SMS notifications
            </Label>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={handleEmergencyAlert}
              disabled={createAlertMutation.isPending}
              className="flex-1 bg-emergency hover:bg-emergency/90"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {createAlertMutation.isPending ? "Sending..." : "Send Emergency Alert"}
            </Button>
            <Button
              type="submit"
              disabled={createAlertMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {createAlertMutation.isPending ? "Sending..." : "Send Alert"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
